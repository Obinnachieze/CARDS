B2B Automated Card Delivery
System Design & Implementation Guide
Full Technical Specification — All 7 Systems


1. Data Model
The data model is the foundation of the entire B2B system. Every other system depends on how well this is structured. You are dealing with multi-tenant architecture — multiple companies, each with their own employees, templates, and delivery history — so your schema must enforce strict isolation.

1.1 Technology Recommendation
Use PostgreSQL as your primary database. It supports JSON columns for flexible card metadata, has robust date/time functions for birthday querying, and row-level security (RLS) for multi-tenant isolation.
•	PostgreSQL 15+ — primary relational database
•	Prisma ORM — type-safe queries, auto-migrations, great with Next.js/Node
•	Supabase — if you want managed Postgres with built-in auth and RLS already configured

1.2 Core Tables
Organizations Table
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,  -- e.g. 'acme-corp'
  owner_id      UUID REFERENCES users(id),
  plan          TEXT DEFAULT 'free',   -- free | pro | enterprise
  settings      JSONB DEFAULT '{}',    -- custom config
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

Members Table
This is the most critical table. Store birth_month and birth_day separately from birth_year. This makes the daily cron query extremely fast and avoids privacy issues — you don't need the year, only when to celebrate.
CREATE TABLE members (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(id),     -- if they have an account
  email          TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  role_title     TEXT,                          -- e.g. 'Senior Engineer'
  department     TEXT,                          -- e.g. 'Engineering'
  birth_month    SMALLINT CHECK (birth_month BETWEEN 1 AND 12),
  birth_day      SMALLINT CHECK (birth_day BETWEEN 1 AND 31),
  avatar_url     TEXT,
  status         TEXT DEFAULT 'active',         -- active | inactive
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

Card Templates Table
CREATE TABLE card_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id),
  name           TEXT NOT NULL,
  canvas_data    JSONB NOT NULL,   -- your existing canvas JSON
  thumbnail_url  TEXT,
  is_default     BOOLEAN DEFAULT false,
  category       TEXT DEFAULT 'birthday',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

Delivery Log Table
Every automated send must be logged. This gives you auditability, retry logic, and the admin dashboard data.
CREATE TABLE delivery_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id),
  member_id      UUID REFERENCES members(id),
  card_id        UUID REFERENCES cards(id),
  trigger_type   TEXT DEFAULT 'birthday',
  status         TEXT DEFAULT 'pending',  -- pending | sent | failed | skipped
  scheduled_for  DATE NOT NULL,
  sent_at        TIMESTAMPTZ,
  error_message  TEXT,
  retry_count    SMALLINT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

1.3 Key Database Indexes
Add these indexes or your cron job will slow to a crawl as you scale to thousands of members.
-- Fast birthday lookup (the cron query)
CREATE INDEX idx_members_birthday ON members(birth_month, birth_day)
  WHERE status = 'active';

-- Fast org member lookup
CREATE INDEX idx_members_org ON members(org_id);

-- Delivery log lookup by date
CREATE INDEX idx_delivery_date ON delivery_logs(scheduled_for, status);

2. Member Onboarding
There are two ways members enter the system: admin CSV bulk import, and self-registration via invite link. You should build both since enterprise clients need bulk import and smaller teams prefer invite links.

2.1 Admin CSV Bulk Import
Libraries
•	papaparse — CSV parsing in the browser (lightweight, handles edge cases)
•	zod — schema validation of each row before inserting
•	react-dropzone — drag-and-drop file upload UI

CSV Format
full_name,email,role_title,department,birth_month,birth_day
Jane Smith,jane@acme.com,Product Manager,Product,3,15
John Doe,john@acme.com,Engineer,Engineering,11,22

Import Flow
1. Admin uploads CSV file. 2. Parse it in the browser with papaparse. 3. Validate each row with zod (check email format, birth_month 1-12, birth_day 1-31). 4. Show the admin a preview table with any errors highlighted. 5. On confirm, POST the validated rows to your API. 6. API upserts rows using ON CONFLICT (org_id, email) DO UPDATE so re-importing does not create duplicates.
// Validation schema with zod
const MemberRowSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  role_title: z.string().optional(),
  birth_month: z.coerce.number().int().min(1).max(12),
  birth_day: z.coerce.number().int().min(1).max(31),
});

2.2 Invite Link Self-Registration
The admin generates a unique invite link per organization. When an employee clicks it, they see a simple form to enter their name, role, and birthday.
-- Invite tokens table
CREATE TABLE org_invites (
  token      TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organizations(id),
  expires_at TIMESTAMPTZ,
  max_uses   INT,
  use_count  INT DEFAULT 0
);
•	Generate a token, store it, and form the URL: yourapp.com/join/[token]
•	The join page validates the token, then lets the employee fill in their details
•	On submit, create the member row linked to the org
•	Optionally send a welcome email confirming they have been added

3. The Birthday Watcher (Scheduler)
This is the engine of the entire feature. A cron job runs daily, finds all birthdays matching today's date, and fires the card generation pipeline for each one. Getting this right means being resilient to failures, time zones, and duplicate sends.

3.1 Technology Options
Option A	node-cron — runs inside your Node.js server process. Simple, good for getting started.

Option B	BullMQ + Redis — job queue with retry, delay, and concurrency control. Recommended for production.

Option C	Inngest — managed event-driven job platform. Zero infrastructure. Best if you are on Vercel/serverless.

Option D	Supabase pg_cron — runs SQL directly in Postgres on a schedule. Simplest if already using Supabase.

Recommendation: Start with node-cron for MVP, migrate to BullMQ when you need retry logic and parallel processing at scale.

3.2 The Core Cron Job
import cron from 'node-cron';
import { processBirthdays } from './birthdayProcessor';

// Runs at 8:00 AM UTC every day
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const month = today.getUTCMonth() + 1;  // 1-12
  const day   = today.getUTCDate();
  console.log(`Running birthday cron for ${month}/${day}`);
  await processBirthdays(month, day);
});

3.3 Fetching Today's Birthdays
async function processBirthdays(month: number, day: number) {
  const members = await prisma.member.findMany({
    where: {
      birth_month: month,
      birth_day:   day,
      status: 'active',
      // Exclude if already sent today (idempotency guard)
      delivery_logs: {
        none: {
          trigger_type: 'birthday',
          scheduled_for: new Date().toISOString().split('T')[0],
          status: { in: ['sent', 'pending'] }
        }
      }
    },
    include: { organization: { include: { default_template: true } } }
  });

  for (const member of members) {
    await enqueueCardGeneration(member);
  }
}

3.4 Time Zone Handling
This is a common pitfall. If your server runs UTC but a company is in Lagos (UTC+1), their 8 AM is your 7 AM UTC. Two approaches:
•	Simple approach: Run the cron at midnight UTC and process everyone — acceptable for most B2B use cases.
•	Advanced approach: Store a timezone on each organization, and use pg_cron or scheduled jobs per timezone to fire at 8 AM local time.
For your MVP, the simple approach is fine. Add the organization timezone field to the schema now so you can use it later without a migration headache.

4. Card Auto-Generation
When a birthday fires, the system must take the organization's default template, personalize it with the member's data, optionally enhance the message with AI, and produce a final rendered card ready for delivery.

4.1 Template Personalization
Your canvas already stores card data as JSON. The key is designing templates to have placeholder tokens that get swapped out at generation time.
// Template canvas JSON (designer sets these tokens)
{
  layers: [
    { type: 'text', id: 'greeting', content: 'Happy Birthday, {{member.full_name}}!' },
    { type: 'text', id: 'role',     content: '{{member.role_title}} at {{org.name}}' },
    { type: 'text', id: 'message',  content: '{{ai_generated_message}}' },
    { type: 'image', id: 'bg',      src: '{{template.background_url}}' },
  ]
}

Token Replacement Function
function personalizeTemplate(template: CardTemplate, member: Member, org: Organization) {
  const tokens = {
    '{{member.full_name}}':  member.full_name,
    '{{member.role_title}}': member.role_title || 'Team Member',
    '{{org.name}}':          org.name,
  };
  const json = JSON.stringify(template.canvas_data);
  const replaced = json.replace(
    /{{[^}]+}}/g,
    match => tokens[match] ?? match
  );
  return JSON.parse(replaced);
}

4.2 AI-Powered Message Generation
Instead of a generic 'Happy Birthday!' message, use an LLM to write a warm, personalized message based on the member's name, role, and department. This is where your product becomes genuinely special.

Libraries
•	Anthropic SDK — npm install @anthropic-ai/sdk
•	OpenAI SDK — npm install openai (alternative)
•	ai (Vercel AI SDK) — abstracts both, easier to swap providers

The Prompt
async function generateBirthdayMessage(member: Member, org: Organization) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',  // Fast and cheap for this use case
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Write a warm, professional birthday message for:`,
        Name: ${member.full_name}
        Role: ${member.role_title || 'team member'}
        Company: ${org.name}
        Keep it under 2 sentences. Professional but heartfelt. No emojis.`
    }]
  });

  return message.content[0].text;
}

4.3 Card Rendering to Image
To send the card in an email, you need to render the canvas JSON to an actual image. This is done server-side.
•	Puppeteer — headless Chrome, renders your card URL to PNG. Most reliable since it uses the same render engine as the browser.
•	@napi-rs/canvas — server-side canvas API. Faster than Puppeteer but requires manual rendering logic.
•	html-to-image (client-side) — only for browser preview, not server use.

Puppeteer Rendering Flow
import puppeteer from 'puppeteer';

async function renderCardToImage(cardShareUrl: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  await page.goto(cardShareUrl, { waitUntil: 'networkidle0' });
  const image = await page.screenshot({ type: 'png', fullPage: false });
  await browser.close();
  return image as Buffer;
}

5. Delivery (Email)
The delivery system takes the rendered card and sends it to the member's email. You need a transactional email provider, a good email template, and robust error handling.

5.1 Email Provider Options
Resend	Best developer experience. Simple API. Built for Next.js. Recommended.

SendGrid	Enterprise-grade. High deliverability. More complex setup.

Nodemailer + SMTP	Free but you manage deliverability yourself. Good for testing only.

Postmark	Excellent deliverability. Good for transactional emails.

5.2 Email Sending with Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBirthdayCard(member: Member, org: Organization, cardUrl: string) {
  const { data, error } = await resend.emails.send({
    from: `${org.name} <cards@yourapp.com>`,
    to: member.email,
    subject: `Happy Birthday, ${member.full_name}! 🎂`,
    html: buildEmailHTML(member, org, cardUrl),
  });

  if (error) throw new Error(error.message);
  return data;
}

5.3 Email Template Design
Two delivery strategies — choose based on your card rendering approach:
•	Strategy A (Recommended): Embed the card as an inline image in the email body, plus a 'View Full Card' button linking to the share URL. Works in all email clients.
•	Strategy B: Send only the share link with a nice preview image. Simpler to build but relies on the recipient clicking through.

React Email (Recommended for HTML templates)
Use the react-email library to build beautiful, responsive email templates in React instead of raw HTML. Install with: npm install react-email @react-email/components
import { Html, Body, Container, Img, Button, Text } from '@react-email/components';

export function BirthdayCardEmail({ member, org, cardImageUrl, cardShareUrl }) {
  return (
    <Html>
      <Body style={{ fontFamily: 'Arial, sans-serif', background: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Text>Hi {member.full_name}, your team is celebrating you today!</Text>
          <Img src={cardImageUrl} alt='Birthday Card' width='560' />
          <Button href={cardShareUrl}>View Your Card</Button>
        </Container>
      </Body>
    </Html>
  );
}

5.4 Failure Handling & Retries
Email delivery can fail. You must handle this gracefully.
•	On failure, set delivery_log.status = 'failed' and store the error message
•	Implement a retry mechanism — attempt up to 3 times with exponential backoff (1 min, 5 min, 30 min)
•	After 3 failures, mark as 'permanently_failed' and alert the admin
•	Use BullMQ's built-in retry logic if you adopt it as your job queue

6. Admin Dashboard
The admin dashboard is how the company manages the entire system. It needs to give a clear view of members, upcoming birthdays, delivery history, and template management.

6.1 Dashboard Sections
Members Management Page
•	Table of all members with: name, email, role, birthday (month/day), status
•	Add member manually, import via CSV, or copy invite link
•	Edit or deactivate individual members
•	Filter by department, status, upcoming birthdays

Birthday Calendar View
A monthly calendar (or list view) showing whose birthday falls on each day. This helps admins plan ahead and spot any issues with missing birthdays.
•	react-big-calendar or FullCalendar — full-featured calendar component
•	@tanstack/react-table — for the sortable members table

Delivery History Page
•	Log of all automated sends: date, recipient, status (sent/failed/pending)
•	Resend button for failed deliveries
•	Filter by date range, status, member

Template Management
•	Set the default birthday template for the organization
•	Preview what the auto-generated card will look like for a sample member
•	Option to create department-specific templates (e.g., Engineering team gets a different card than Sales)

6.2 Key Dashboard APIs
// GET /api/org/:orgId/members?upcoming_days=30
// Returns members with birthdays in the next N days

// GET /api/org/:orgId/delivery-logs?status=failed
// Returns failed delivery attempts

// POST /api/org/:orgId/delivery-logs/:logId/retry
// Manually retry a failed delivery

// GET /api/org/:orgId/stats
// Returns: total members, cards sent this year, next birthday

6.3 Role-Based Access
•	Admin role — full access to all settings, members, templates
•	Manager role — can view members and delivery history but cannot change templates
•	Member role — can only edit their own profile (birthday, role)
Implement this with a roles column on org_members table and middleware checks on each API route.

7. Notifications & Failure Handling
A system that runs silently in the background must also communicate when something goes wrong. Admins need visibility into failures without having to actively check the dashboard.

7.1 Admin Failure Alerts
When a card fails to deliver after all retries, send an email to the org admin with details about who was missed and why.
async function notifyAdminOfFailure(org: Organization, member: Member, error: string) {
  await resend.emails.send({
    from: 'alerts@yourapp.com',
    to: org.owner.email,
    subject: `Action needed: Birthday card failed for ${member.full_name}`,
    html: `
      <p>We were unable to deliver the birthday card to ${member.full_name}.</p>
      <p>Email: ${member.email}</p>
      <p>Error: ${error}</p>
      <a href='yourapp.com/dashboard/delivery-logs'>View & Retry</a>
    `
  });
}

7.2 Pre-Delivery Approval Mode (Optional Premium Feature)
Some enterprise clients may want to review and approve the AI-generated card before it goes out. This is a premium feature toggle.
•	48 hours before the birthday, generate the card and create a delivery_log with status = 'pending_approval'
•	Send the admin a preview email: 'A birthday card is scheduled to send to Jane Smith on Friday. Review here.'
•	Admin can approve, edit, or cancel
•	If no action is taken by midnight before the birthday, send automatically (configurable behavior)

7.3 Monitoring & Observability
As your system grows, you need to know when the cron job fires, how many cards are processed, and where errors occur.
•	Sentry — catch and track errors in the cron job and email pipeline (npm install @sentry/node)
•	Logtail / Axiom / Datadog — structured logging for the delivery pipeline
•	Uptime monitoring (Better Uptime or Cronitor) — alerts if your cron job stops firing

Cron Job Heartbeat
// At the START of each cron run, ping a heartbeat URL
// Cronitor or BetterUptime alerts you if it stops pinging
await fetch(process.env.CRONITOR_HEARTBEAT_URL);
// Then run the actual job...
await processBirthdays(month, day);

7.4 The Full Delivery Pipeline (End to End)
async function enqueueCardGeneration(member: Member) {
  // 1. Create a delivery_log record (status: pending)
  const log = await createDeliveryLog(member);

  try {
    // 2. Get the org's default template
    const template = await getOrgDefaultTemplate(member.org_id);

    // 3. Generate AI birthday message
    const aiMessage = await generateBirthdayMessage(member, member.organization);

    // 4. Personalize template with tokens
    const personalizedCanvas = personalizeTemplate(template, member, aiMessage);

    // 5. Save as a new card instance
    const card = await saveCardInstance(personalizedCanvas, member);

    // 6. Render card to image (via Puppeteer)
    const imageBuffer = await renderCardToImage(card.share_url);

    // 7. Upload image to storage (S3 / Supabase Storage)
    const imageUrl = await uploadImage(imageBuffer, card.id);

    // 8. Send the email
    await sendBirthdayCard(member, member.organization, card.share_url, imageUrl);

    // 9. Mark delivery as sent
    await updateDeliveryLog(log.id, { status: 'sent', sent_at: new Date() });

  } catch (error) {
    await updateDeliveryLog(log.id, { status: 'failed', error_message: error.message });
    await notifyAdminOfFailure(member.organization, member, error.message);
  }
}

Recommended Build Order
Build in this sequence to always have something working and testable at each stage:
1.	Database schema + Prisma models (1 day)
2.	CSV import + invite link onboarding (2 days)
3.	Basic cron job + birthday query (1 day)
4.	Template token personalization (1 day)
5.	Email delivery with Resend (1 day)
6.	AI message generation (1 day)
7.	Card rendering to image with Puppeteer (2 days)
8.	Admin dashboard (3-5 days)
9.	Retry logic, failure alerts, monitoring (1-2 days)

Total estimated build time: 2-3 weeks for a solid MVP. The first 6 steps give you a fully working end-to-end flow. Steps 7-9 polish it to production quality.
