const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const URL = 'https://wsmrukzdfxkixlzoabvo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbXJ1a3pkZnhraXhsem9hYnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2NDI4MywiZXhwIjoyMDk0OTQwMjgzfQ.z2wALkLM2S25gjCZgJOvZdjRfN40s7Fcy1-MPEjlUcw';

const supabase = createClient(URL, KEY, { realtime: { transport: ws } });
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function fetchJson(url) {
  try {
    const r = await fetch(url, { headers: H });
    if (!r.ok) return { _error: `${r.status} ${r.statusText}`, _body: await r.text().catch(() => '') };
    if (r.status === 204 || r.headers.get('content-length') === '0') return [];
    return await r.json();
  } catch (e) { return { _error: e.message }; }
}

async function main() {
  console.log('='.repeat(130));
  console.log('SUPABASE DATABASE AUDIT - DETAILED');
  console.log('='.repeat(130));

  // Get OpenAPI schema which shows all table definitions
  console.log('\n\n### GETTING OPENAPI SCHEMA ###');
  const openapi = await fetchJson(`${URL}/rest/v1/`);
  if (openapi._error) {
    console.log('OpenAPI error:', openapi._error, openapi._body?.substring(0, 200));
  } else {
    // Extract table schemas from OpenAPI
    const schemas = openapi.components?.schemas || {};
    const tables = Object.keys(schemas).filter(k => !k.startsWith('_'));
    console.log(`Tables in OpenAPI spec: ${tables.join(', ')}`);
    for (const t of ['payments', 'users', 'ideas', 'competitions']) {
      const s = schemas[t] || schemas[`public.${t}`];
      if (s) {
        console.log(`\n--- ${t} (from OpenAPI) ---`);
        const props = s.properties || {};
        const required = s.required || [];
        for (const [k, v] of Object.entries(props)) {
          const typ = v.type || 'unknown';
          const fmt = v.format ? ` (${v.format})` : '';
          const req = required.includes(k) ? ' NOT NULL' : '';
          const def = v.default !== undefined ? ` DEFAULT ${v.default}` : '';
          const enums = v.enum ? ` ENUM: ${v.enum.join(', ')}` : '';
          console.log(`  ${k}: ${typ}${fmt}${req}${def}${enums}`);
        }
      }
    }
  }

  // Try querying information_schema by explicitly setting schema via query param
  console.log('\n\n### TRYING INFORMATION_SCHEMA via ?schema= ###');
  const infoCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=column_name,data_type,is_nullable,column_default,character_maximum_length,ordinal_position&table_name=eq.payments&order=ordinal_position&schema=information_schema`);
  if (infoCols._error) {
    console.log('Failed:', infoCols._error, infoCols._body?.substring(0, 150));
  } else {
    console.log('Payments columns:');
    console.table(infoCols);
  }

  // Try with Accept header
  console.log('\n\n### TRYING pg_catalog.pg_tables via REST ###');
  const pgTables = await fetchJson(`${URL}/rest/v1/pg_tables?select=*&schemaname=eq.public`);
  if (pgTables._error) console.log('Failed:', pgTables._error);
  else console.table(pgTables);

  // 1. Try PG catalog for constraint info
  console.log('\n\n### TRYING CONSTRAINT INFO ###');
  const constraints = await fetchJson(`${URL}/rest/v1/information_schema.table_constraints?select=*&table_schema=eq.public&table_name=eq.payments`);
  if (constraints._error) console.log('Failed:', constraints._error);
  else console.table(constraints);

  const keyUsage = await fetchJson(`${URL}/rest/v1/information_schema.key_column_usage?select=*&table_schema=eq.public&table_name=eq.payments`);
  if (keyUsage._error) console.log('Failed:', keyUsage._error);
  else console.table(keyUsage);

  // 2. All tables via pg_catalog
  console.log('\n\n### ALL TABLES (pg_catalog) ###');
  const allTables = await fetchJson(`${URL}/rest/v1/pg_catalog.pg_tables?select=schemaname,tablename,tableowner,rowsecurity&schemaname=eq.public`);
  if (allTables._error) console.log('pg_tables failed:', allTables._error);
  else console.table(allTables);

  // 3. Try triggers via pg_catalog / information_schema
  console.log('\n\n### TRIGGERS ###');
  const trigs = await fetchJson(`${URL}/rest/v1/information_schema.triggers?select=*&event_object_schema=eq.public`);
  if (trigs._error) console.log('triggers failed:', trigs._error);
  else console.table(trigs);

  // 4. Try RLS policies
  console.log('\n\n### RLS POLICIES (via pg_policy) ###');
  const policies = await fetchJson(`${URL}/rest/v1/pg_catalog.pg_policy?select=*`);
  if (policies._error) console.log('pg_policy failed:', policies._error);
  else console.table(policies);

  // 5. Detailed info for specific columns the user cares about
  console.log('\n\n### DETAILED: users table columns ###');
  const userCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=column_name,data_type,is_nullable,column_default,character_maximum_length,ordinal_position&table_name=eq.users&order=ordinal_position&schema=information_schema`);
  if (userCols._error) console.log('Failed:', userCols._error);
  else console.table(userCols);

  console.log('\n\n### DETAILED: ideas table columns ###');
  const ideaCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=column_name,data_type,is_nullable,column_default,character_maximum_length,ordinal_position&table_name=eq.ideas&order=ordinal_position&schema=information_schema`);
  if (ideaCols._error) console.log('Failed:', ideaCols._error);
  else console.table(ideaCols);

  console.log('\n\n### DETAILED: competitions table columns ###');
  const compCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=column_name,data_type,is_nullable,column_default,character_maximum_length,ordinal_position&table_name=eq.competitions&order=ordinal_position&schema=information_schema`);
  if (compCols._error) console.log('Failed:', compCols._error);
  else console.table(compCols);

  console.log('\n\n### DETAILED: payments table columns ###');
  const payCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=column_name,data_type,is_nullable,column_default,character_maximum_length,ordinal_position&table_name=eq.payments&order=ordinal_position&schema=information_schema`);
  if (payCols._error) console.log('Failed:', payCols._error);
  else console.table(payCols);

  // Check if there's a votes table
  console.log('\n\n### VOTES TABLE ###');
  const voteCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=*&table_name=eq.votes&order=ordinal_position&schema=information_schema`);
  if (voteCols._error) console.log('Failed:', voteCols._error);
  else console.table(voteCols);

  // Check profiles
  console.log('\n\n### PROFILES TABLE ###');
  const profCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=*&table_name=eq.profiles&order=ordinal_position&schema=information_schema`);
  if (profCols._error) console.log('Failed:', profCols._error);
  else console.table(profCols);

  // Check comments
  console.log('\n\n### COMMENTS TABLE ###');
  const commCols = await fetchJson(`${URL}/rest/v1/information_schema.columns?select=*&table_name=eq.comments&order=ordinal_position&schema=information_schema`);
  if (commCols._error) console.log('Failed:', commCols._error);
  else console.table(commCols);

  // Try to get all tables in public schema
  console.log('\n\n### ALL TABLES (information_schema) ###');
  const allT = await fetchJson(`${URL}/rest/v1/information_schema.tables?select=*&table_schema=eq.public&order=table_name&schema=information_schema`);
  if (allT._error) console.log('Failed:', allT._error);
  else console.table(allT);

  console.log('\n' + '='.repeat(130));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(130));
}

main().catch(console.error);
