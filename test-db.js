const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrgs() {
    const { data, error } = await supabase.from('organizations').select('*');
    fs.writeFileSync('test-db-output.json', JSON.stringify({ data, error }, null, 2));
}

checkOrgs();
