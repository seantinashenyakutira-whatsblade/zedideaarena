const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const sql = fs.readFileSync(path.resolve(__dirname, '../../supabase/migrations/20260710_onboarding_extend.sql'), 'utf8');

async function run() {
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    // fallback: direct SQL query via raw endpoint
    const { error: e2 } = await supabase.from('_sql').insert([{ query: sql }]).maybeSingle();
    if (e2) {
      console.log('Trying REST query...');
      const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Migration failed:', text);
        process.exit(1);
      }
    }
  }
  console.log('Migration completed successfully');
}
run().catch(e => { console.error(e); process.exit(1); });
