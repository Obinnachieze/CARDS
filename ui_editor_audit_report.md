# UI/UX AUDIT REPORT: CANVAS EDITOR

---

## 🔴 CRITICAL UX FLAWS
(Breaks the user experience entirely — fix immediately)

- **[components/editor/sticker-sidebar.tsx:72]** — Hardcoded `bg-white` on Sidebar — The sidebars clash violently with the dark canvas theme, causing eye strain and a broken visual aesthetic. — Use `bg-zinc-950` or `bg-[#0c0c0e]`.
- **[components/editor/music-sidebar.tsx:70]** — Hardcoded `bg-white` on Sidebar — Massive visual inconsistency with the editor's core theme. — Align with dark theme palette.
- **[components/editor/settings-sidebar.tsx:72]** — Hardcoded `bg-white` on Sidebar — Completes the "White Sidebar" trifecta that ruins the premium dark editor feel. — Shift to dark mode.
- **[components/editor/share-dialog.tsx:194]** — Hardcoded `bg-white` on Share Modal — A bright white modal appearing over a dark editor is jarring. — Force dark theme on all editor modals.
- **[components/editor/save-modal.tsx:74]** — Hardcoded `bg-white` on Save Modal — Breaks the flow of the creation process with high-contrast light pops. — Apply dark theme.
- **[components/editor/toolbar.tsx:180]** — Hardcoded White Font List — The font selection list is unusable against dark backgrounds. — Update dropdown styles to use dark theme vars.
- **[components/editor/sticker-sidebar.tsx:109]** — Emoji Picker forced to `Theme.LIGHT` — The emoji picker looks like it belongs to a different app entirely. — Set `theme={Theme.DARK}`.

## 🟠 HIGH PRIORITY DESIGN ISSUES
(Significantly damages usability or trust)

- **[components/editor/fabric-canvas.tsx:310-330]** — Invisible Drawing Cursors — Pencil and Eraser cursors have black strokes, making them invisible on the default dark canvas. — Use high-contrast white/adaptive strokes.
- **[components/editor/music-sidebar.tsx:100]** — Invisible Text — `text-gray-900` headings on dark backgrounds will be unreadable. — Switch to `text-zinc-100`.
- **[components/editor/contextual-toolbar.tsx:45]** — White Floating Toolbar — The toolbar and its connector are white, creating a "sticker" effect on the dark canvas rather than an integrated tool. — Apply semi-transparent dark glassmorphism.
- **[components/editor/app/create/[type]/page.tsx:110]** — Light Gray Background — The editor container uses `bg-gray-100`, creating a "frame" that clashes with the inner dark editor. — Use `bg-zinc-950`.

## 🟡 MEDIUM PRIORITY
(Noticeable friction or inconsistency)

- **[components/editor/settings-sidebar.tsx:179]** — Native `confirm()` dialogs — Browser-native popups feel cheap in a premium SaaS product. — Replace with custom themed confirmation modals.
- **[components/editor/header.tsx:150]** — Inconsistent Border Radius — Preview button uses `rounded-[5px]` while the rest of the app uses `rounded-xl` or `rounded-full`. — Normalize to `rounded-xl`.
- **[components/editor/header.tsx:140-160]** — Non-normalized Icons — Icon sizes vary from 16px to 22px in the same row. — Normalize all header icons to 20px.
- **[components/editor/preview-modal.tsx:238]** — Hardcoded Mobile Offset — `translateX(-150px)` for mobile may offset the card off-viewport on small screens. — Use dynamic or percentage-based translation.
- **[components/editor/contextual-toolbar.tsx:30]** — Collision Logic — Floating toolbar can disappear off-screen if an element is too high. — Implement simple collision detection to flip the toolbar below the element.

## 🟢 POLISH & BEST PRACTICE
(Small improvements that elevate the experience)

- **[components/editor/card-wrapper.tsx:350]** — Low Contrast Guidance — "Click to Flip" text uses `text-gray-400`, which may fade into certain card designs. — Add a subtle text shadow or higher contrast.
- **[components/editor/header.tsx:45]** — Background Color Tweak — Header uses `bg-slate-900` which is slightly "too blue" compared to the canvas. — Use `#0c0c0e` for true alignment.
- **[components/editor/toolbar.tsx:400]** — Mobile Panel UX — Rotating a `ChevronLeft` 270 degrees is confusing for "Close". — Use `ChevronDown` or a standard `X` icon.

---

## 🎯 TOP 10 PRIORITY FIXES

1. **Dark Theme Implementation** (All Sidebars/Modals): Move from `bg-white` to `bg-zinc-950`.
2. **Invisible Text Fixes**: Repace `text-gray-900` with `text-zinc-100` in sidebars.
3. **Canvas Cursor Visibility**: Update Fabric cursors to white/adaptive strokes.
4. **Emoji Picker Theme**: Change `Theme.LIGHT` to `Theme.DARK`.
5. **Contextual Toolbar Re-styling**: Change from white to dark glassmorphism.
6. **Font List Dark Mode**: Fix the "All Fonts" dropdown in the toolbar.
7. **Native Confirm Dialogs**: Replace browse `confirm()` with themed modals.
8. **Header Normalization**: Fix icon sizes and border-radius inconsistencies.
9. **Mobile Preview Logic**: Refine `translateX` in `PreviewModal`.
10. **Background Alignment**: Fix the `bg-gray-100` page container.

## 💡 QUICK WINS
- Update Emoji Picker theme (1 line change).
- Normalize header icons to 20px.
- Change header border-radius to `rounded-xl`.
- Update Drawing Cursors strokes in `fabric-canvas.tsx`.

## 🗺️ LONG TERM RECOMMENDATIONS
- **Design System Extraction**: Create a set of dark-mode specific primitives (Sidebars, Modals, Inputs) to avoid repeating `bg-zinc-900` everywhere.
- **Responsive Toolbar**: Consider a bottom-drawer approach for mobile sidebars instead of the side-sliding drawer for better thumb reach.
- **Performance**: Optimize the infinite scroll in Sticker sidebar to avoid JS thread blocking during heavy searches.
