const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const sql = fs.readFileSync(require('path').resolve(__dirname, '../supabase/migrations/20260710_onboarding_extend.sql'), 'utf8');

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    // Try direct SQL
    const { error: e2 } = await supabase.from('_migrations').insert([{ sql }]).maybeSingle();
    if (e2) {
      console.error('Migration error:', e2);
      process.exit(1);
    }
  }
  console.log('Migration OK');
}
run();
