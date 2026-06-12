const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const SUPABASE_URL = 'https://wsmrukzdfxkixlzoabvo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbXJ1a3pkZnhraXhsem9hYnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2NDI4MywiZXhwIjoyMDk0OTQwMjgzfQ.z2wALkLM2S25gjCZgJOvZdjRfN40s7Fcy1-MPEjlUcw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: { transport: ws }
});

const AUTH_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function tryRawSql(sql) {
  // Attempt 1: query information_schema directly via REST (if exposed)
  // Supabase exposes information_schema views through PostgREST when using service role
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ sql })
  });
  return response;
}

async function queryViaRest(schema, table, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${schema ? schema + '/' : ''}${table}?${params}`;
  try {
    const response = await fetch(url, {
      headers: AUTH_HEADERS
    });
    if (!response.ok) {
      const text = await response.text();
      return { error: `${response.status}: ${text}` };
    }
    return await response.json();
  } catch (e) {
    return { error: e.message };
  }
}

async function queryInfoSchema(tableName) {
  // Try direct information_schema query via REST
  const url = `${SUPABASE_URL}/rest/v1/information_schema.columns?select=column_name,data_type,character_maximum_length,column_default,is_nullable,ordinal_position&table_name=eq.${tableName}&table_schema=eq.public&order=ordinal_position`;
  try {
    const response = await fetch(url, { headers: AUTH_HEADERS });
    if (response.ok) return await response.json();
  } catch (e) {}
  return null;
}

async function getPrimaryKeys(tableName) {
  const url = `${SUPABASE_URL}/rest/v1/information_schema.table_constraints?select=constraint_name&table_name=eq.${tableName}&table_schema=eq.public&constraint_type=eq.PRIMARY%20KEY`;
  try {
    const response = await fetch(url, { headers: AUTH_HEADERS });
    if (!response.ok) return [];
    const constraints = await response.json();
    if (constraints.length === 0) return [];
    const cn = constraints[0].constraint_name;
    const kcuUrl = `${SUPABASE_URL}/rest/v1/information_schema.key_column_usage?select=column_name&constraint_name=eq.${cn}&table_name=eq.${tableName}`;
    const kcuResp = await fetch(kcuUrl, { headers: AUTH_HEADERS });
    if (!kcuResp.ok) return [];
    const kcu = await kcuResp.json();
    return kcu.map(r => r.column_name);
  } catch (e) {
    return [];
  }
}

async function getTableSample(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(3);
  if (error) return { error: error.message };
  return data && data.length > 0 ? data : [];
}

async function getRowCount(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  if (error) return { error: error.message };
  return count;
}

async function auditTable(tableName) {
  console.log(`\n--- ${tableName.toUpperCase()} ---`);

  // Try to get schema from information_schema
  let columns = await queryInfoSchema(tableName);
  const pks = await getPrimaryKeys(tableName);

  if (columns && columns.length > 0) {
    console.log('COLUMNS (from information_schema):');
    console.table(columns.map(c => ({
      ...c,
      is_pk: pks.includes(c.column_name) ? 'YES' : ''
    })));
  } else {
    console.log('(information_schema not accessible via REST; sampling table data instead)');
  }

  // Sample data
  const sample = await getTableSample(tableName);
  if (sample.error) {
    console.log(`SAMPLE DATA ERROR: ${sample.error}`);
  } else if (sample.length > 0) {
    console.log(`SAMPLE ROWS (${sample.length}):`);
    console.table(sample);
  } else {
    console.log('SAMPLE DATA: (empty table)');
  }

  // Row count
  const count = await getRowCount(tableName);
  if (count && count.error) {
    console.log(`ROW COUNT ERROR: ${count.error}`);
  } else {
    console.log(`ROW COUNT: ${count}`);
  }

  return { columns };
}

async function getTriggersViaSQL() {
  // Try to create a temp function to get triggers
  const sql = `
    SELECT trigger_name, event_manipulation, event_object_table,
           action_statement, action_timing, action_orientation
    FROM information_schema.triggers
    WHERE event_object_schema = 'public' AND event_object_table = 'payments'
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
  if (error) return null;
  return data;
}

async function getForeignKeys(tableName) {
  const fkUrl = `${SUPABASE_URL}/rest/v1/information_schema.table_constraints?select=constraint_name&table_name=eq.${tableName}&table_schema=eq.public&constraint_type=eq.FOREIGN%20KEY`;
  try {
    const fkResp = await fetch(fkUrl, { headers: AUTH_HEADERS });
    if (!fkResp.ok) return [];
    return await fkResp.json();
  } catch (e) { return []; }
}

async function checkRls(tableName) {
  const url = `${SUPABASE_URL}/rest/v1/pg_catalog.pg_tables?select=*&schemaname=eq.public&tablename=eq.${tableName}`;
  try {
    const resp = await fetch(url, { headers: AUTH_HEADERS });
    if (!resp.ok) return 'unknown';
    const data = await resp.json();
    return data.length > 0 ? (data[0].rowsecurity ? 'ENABLED' : 'DISABLED') : 'unknown';
  } catch (e) { return 'error'; }
}

async function getAllTables() {
  const url = `${SUPABASE_URL}/rest/v1/information_schema.tables?select=table_name,table_type&table_schema=eq.public&order=table_name`;
  try {
    const resp = await fetch(url, { headers: AUTH_HEADERS });
    if (resp.ok) return await resp.json();
  } catch (e) {}
  return null;
}

async function getAllPolicies() {
  // Try pg_policy via REST (unlikely to work but worth trying)
  const url = `${SUPABASE_URL}/rest/v1/pg_catalog.pg_policy?select=*`;
  try {
    const resp = await fetch(url, { headers: AUTH_HEADERS });
    if (resp.ok) return await resp.json();
  } catch (e) {}
  return null;
}

async function runAllQueries() {
  console.log('='.repeat(120));
  console.log('SUPABASE DATABASE AUDIT - zedideaarena');
  console.log('='.repeat(120));

  // 0. First, check if information_schema is accessible
  const testInfoSchema = await queryViaRest('information_schema', 'columns', 'select=column_name&limit=1');
  console.log('\n### INFO_SCHEMA ACCESSIBLE:', testInfoSchema.error ? 'NO - ' + testInfoSchema.error.substring(0, 80) : 'YES');

  // 1. Payments table
  console.log('\n\n### 1. PAYMENTS TABLE ###');
  await auditTable('payments');

  // Try FK info
  const fks = await getForeignKeys('payments');
  if (fks && fks.length > 0) console.log('FOREIGN KEY CONSTRAINTS:', fks);

  // 2. RLS on payments
  console.log(`\n\n### 2. RLS STATUS: payments: ${await checkRls('payments')} ###`);

  // 3. All tables
  console.log('\n\n### 3. ALL TABLES ###');
  const tables = await getAllTables();
  if (tables) console.table(tables);
  else {
    // Fallback: try selecting from each known table
    console.log('Trying known tables...');
    for (const t of ['payments', 'users', 'ideas', 'competitions', 'profiles', 'votes', 'comments']) {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (!error || !error.message?.includes('does not exist')) {
        console.log(`  ${t}: exists`);
      }
    }
  }

  // 4. Users table
  console.log('\n\n### 4. USERS TABLE ###');
  await auditTable('users');

  // 5. Ideas table
  console.log('\n\n### 5. IDEAS TABLE ###');
  await auditTable('ideas');

  // 6. Triggers & Foreign Keys
  console.log('\n\n### 6. TRIGGERS ###');
  const triggers = await getTriggersViaSQL();
  if (triggers) console.table(triggers);
  else console.log('Could not query triggers (no exec_sql function)');

  // 7. Competitions table
  console.log('\n\n### 7. COMPETITIONS TABLE ###');
  await auditTable('competitions');

  // 8. Row counts
  console.log('\n\n### 8. ROW COUNTS ###');
  for (const t of ['payments', 'users', 'ideas', 'competitions', 'votes', 'comments', 'profiles']) {
    const cnt = await getRowCount(t);
    console.log(`  ${t}: ${cnt && cnt.error ? 'ERROR: ' + cnt.error : cnt}`);
  }

  // 9. All RLS policies
  console.log('\n\n### 9. ALL RLS POLICIES ###');
  const policies = await getAllPolicies();
  if (policies) console.table(policies);
  else console.log('Cannot query pg_policy via REST API');

  // Try querying RLS status per table
  console.log('\nRLS Status per table:');
  for (const t of ['payments', 'users', 'ideas', 'competitions']) {
    console.log(`  ${t}: ${await checkRls(t)}`);
  }

  console.log('\n' + '='.repeat(120));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(120));
}

runAllQueries().catch(console.error);
