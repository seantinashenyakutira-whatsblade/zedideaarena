const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const URL = 'https://wsmrukzdfxkixlzoabvo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbXJ1a3pkZnhraXhsem9hYnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2NDI4MywiZXhwIjoyMDk0OTQwMjgzfQ.z2wALkLM2S25gjCZgJOvZdjRfN40s7Fcy1-MPEjlUcw';

const supabase = createClient(URL, KEY, { realtime: { transport: ws } });
const BASE_H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function fetchSchemaJson(schema, table, select = '*', params = '') {
  const url = `${URL}/rest/v1/${table}?select=${select}${params ? '&' + params : ''}`;
  const pref = `params=schema=${schema}`;
  const r = await fetch(url, {
    headers: {
      ...BASE_H,
      'Accept': 'application/json; schema=' + schema,
      'Prefer': pref
    }
  });
  if (!r.ok) {
    return { _error: `${r.status}`, _body: await r.text().catch(() => '') };
  }
  return await r.json();
}

async function main() {
  console.log('='.repeat(130));
  console.log('SUPABASE AUDIT - Schema switching via headers');
  console.log('='.repeat(130));

  // Try with Accept + Prefer schema switching
  const tables = ['payments', 'users', 'ideas', 'competitions'];

  for (const t of tables) {
    console.log(`\n\n### ${t.toUpperCase()} - via information_schema.columns ###`);
    const cols = await fetchSchemaJson('information_schema', 'columns',
      'column_name,data_type,is_nullable,column_default,character_maximum_length,ordinal_position',
      `table_name=eq.${t}&table_schema=eq.public&order=ordinal_position`
    );
    if (cols._error) {
      console.log(`ERROR [${cols._error}]:`, cols._body?.substring(0, 200));
    } else {
      console.table(cols);
    }
  }

  // Try tables listing
  console.log(`\n\n### ALL TABLES ###`);
  const allT = await fetchSchemaJson('information_schema', 'tables',
    'table_name,table_type',
    'table_schema=eq.public&order=table_name'
  );
  if (allT._error) console.log(`ERROR:`, allT._body?.substring(0, 200));
  else console.table(allT);

  // Try triggers
  console.log(`\n\n### TRIGGERS ###`);
  const trigs = await fetchSchemaJson('information_schema', 'triggers', '*',
    'event_object_schema=eq.public&event_object_table=eq.payments'
  );
  if (trigs._error) console.log(`ERROR:`, trigs._body?.substring(0, 200));
  else console.table(trigs);

  // Try foreign keys
  console.log(`\n\n### FOREIGN KEYS ON payments ###`);
  const fks = await fetchSchemaJson('information_schema', 'table_constraints', '*',
    'table_schema=eq.public&table_name=eq.payments&constraint_type=eq.FOREIGN%20KEY'
  );
  if (fks._error) console.log(`ERROR:`, fks._body?.substring(0, 200));
  else console.table(fks);

  // RLS via pg_catalog
  console.log(`\n\n### PG_TABLES (RLS) ###`);
  const pt = await fetchSchemaJson('pg_catalog', 'pg_tables', 'tablename,rowsecurity',
    'schemaname=eq.public&order=tablename'
  );
  if (pt._error) console.log(`ERROR:`, pt._body?.substring(0, 200));
  else console.table(pt);

  // All constraints on payments
  console.log(`\n\n### ALL CONSTRAINTS ON payments ###`);
  const cons = await fetchSchemaJson('information_schema', 'table_constraints', 'constraint_name,constraint_type',
    'table_schema=eq.public&table_name=eq.payments&order=constraint_type'
  );
  if (cons._error) console.log(`ERROR:`, cons._body?.substring(0, 200));
  else console.table(cons);

  console.log('\n' + '='.repeat(130));
  console.log('DONE');
}

main().catch(console.error);
