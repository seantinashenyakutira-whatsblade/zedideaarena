const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const URL = 'https://wsmrukzdfxkixlzoabvo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbXJ1a3pkZnhraXhsem9hYnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2NDI4MywiZXhwIjoyMDk0OTQwMjgzfQ.z2wALkLM2S25gjCZgJOvZdjRfN40s7Fcy1-MPEjlUcw';

const supabase = createClient(URL, KEY, { realtime: { transport: ws } });
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function run() {
  // Try to discover RPC functions by calling common names
  const candidates = [
    { name: 'exec_sql', params: { sql: 'SELECT 1' } },
    { name: 'exec_sql', params: { sql_text: 'SELECT 1' } },
    { name: 'run_sql', params: { sql: 'SELECT 1' } },
    { name: 'sql', params: { query: 'SELECT 1' } },
    { name: 'query', params: { query: 'SELECT 1' } },
    { name: 'execute_sql', params: { query: 'SELECT 1' } },
    { name: 'raw_sql', params: { query: 'SELECT 1' } },
  ];

  for (const c of candidates) {
    const { data, error } = await supabase.rpc(c.name, c.params);
    if (!error) {
      console.log(`FOUND function "${c.name}"! Result:`, JSON.stringify(data).substring(0, 200));
    } else {
      console.log(`  ${c.name}: ${error.message.substring(0, 100)}`);
    }
  }

  // Also try to call via raw HTTP to /rest/v1/rpc/
  for (const name of candidates.map(c => c.name).filter((v,i,a) => a.indexOf(v)===i)) {
    try {
      const r = await fetch(`${URL}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({})
      });
      if (r.status !== 404 && r.status !== 400) {
        console.log(`HTTP ${r.status} for /rpc/${name}:`, await r.text().then(t => t.substring(0, 100)).catch(() => ''));
      }
    } catch(e) {}
  }

  // Try to get the OpenAPI spec properly
  console.log('\n--- OpenAPI spec ---');
  try {
    const r = await fetch(`${URL}/rest/v1/`, {
      headers: { ...H, Accept: 'application/json' }
    });
    if (r.ok) {
      const text = await r.text();
      console.log('Length:', text.length);
      console.log('First 2000 chars:', text.substring(0, 2000));
    } else {
      console.log('Status:', r.status, await r.text().then(t => t.substring(0, 200)).catch(() => ''));
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}

run().catch(console.error);
