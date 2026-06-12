const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const URL = 'https://wsmrukzdfxkixlzoabvo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbXJ1a3pkZnhraXhsem9hYnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2NDI4MywiZXhwIjoyMDk0OTQwMjgzfQ.z2wALkLM2S25gjCZgJOvZdjRfN40s7Fcy1-MPEjlUcw';

const supabase = createClient(URL, KEY, { realtime: { transport: ws } });
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function runSql(query) {
  // Try Supabase's /pg/v1/sql endpoint (PostgREST SQL endpoint)
  try {
    const r = await fetch(`${URL}/pg/v1/sql`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({ query })
    });
    if (r.ok) return { data: await r.json() };
    const text = await r.text();
    return { error: `${r.status}: ${text.substring(0, 500)}` };
  } catch (e) {
    return { error: e.message };
  }
}

async function runViaRpc(sql, funcName = 'exec_sql') {
  const { data, error } = await supabase.rpc(funcName, { sql_text: sql, sql: sql, query: sql });
  if (error) return { error: error.message };
  return { data };
}

async function tryAllMethods(sql) {
  // Try /pg/v1/sql first
  const r1 = await runSql(sql);
  if (!r1.error) return r1;
  console.log(`  /pg/v1/sql failed:`, r1.error.substring(0, 120));

  // Try various rpc function names
  for (const fn of ['exec_sql', 'run_sql', 'query', 'sql', 'raw_sql', 'execute_sql']) {
    const r = await runViaRpc(sql, fn);
    if (!r.error) return r;
  }
  return { error: 'all methods failed' };
}

async function query(sql, label) {
  console.log(`\n\n### ${label} ###`);
  const result = await tryAllMethods(sql);
  if (result.error) {
    console.log(`ERROR: ${result.error.substring(0, 300)}`);
    return null;
  }
  if (Array.isArray(result.data)) {
    console.table(result.data);
  } else {
    console.log(result.data);
  }
  return result.data;
}

async function main() {
  console.log('='.repeat(130));
  console.log('SUPABASE DATABASE AUDIT - RAW SQL VIA /pg/v1/sql');
  console.log('='.repeat(130));

  // Test connectivity first
  console.log('\n--- Testing /pg/v1/sql endpoint ---');
  const testR = await runSql('SELECT 1 AS test');
  console.log('Test result:', JSON.stringify(testR));

  // 1. Payments table schema
  await query(`
    SELECT column_name, data_type, character_maximum_length, column_default, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments'
    ORDER BY ordinal_position
  `, '1. PAYMENTS TABLE SCHEMA');

  // 2. RLS on payments
  await query(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'payments'
  `, '2a. RLS on payments');

  await query(`
    SELECT pol.polname AS policy_name,
           CASE pol.polcmd WHEN '*' THEN 'ALL' WHEN 'r' THEN 'SELECT' WHEN 'w' THEN 'UPDATE' WHEN 'a' THEN 'INSERT' WHEN 'd' THEN 'DELETE' END AS command,
           pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
           pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public' AND cls.relname = 'payments'
  `, '2b. RLS policies on payments');

  // 3. ALL tables in public
  await query(`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `, '3. ALL TABLES');

  // 4. Users table schema
  await query(`
    SELECT column_name, data_type, character_maximum_length, column_default, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
    ORDER BY ordinal_position
  `, '4. USERS TABLE SCHEMA');

  // 5. Ideas table schema
  await query(`
    SELECT column_name, data_type, character_maximum_length, column_default, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ideas'
    ORDER BY ordinal_position
  `, '5. IDEAS TABLE SCHEMA');

  // 6. Triggers on payments
  await query(`
    SELECT trigger_name, event_manipulation, action_statement, action_timing, action_orientation
    FROM information_schema.triggers
    WHERE event_object_schema = 'public' AND event_object_table = 'payments'
  `, '6a. TRIGGERS ON payments');

  // 6b. Foreign keys on payments
  await query(`
    SELECT
      tc.constraint_name, tc.constraint_type,
      kcu.column_name,
      ccu.table_schema AS foreign_schema,
      ccu.table_name AS foreign_table,
      ccu.column_name AS foreign_column,
      rc.update_rule, rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'payments'
  `, '6b. FOREIGN KEYS ON payments');

  // 7. Competitions table schema
  await query(`
    SELECT column_name, data_type, character_maximum_length, column_default, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'competitions'
    ORDER BY ordinal_position
  `, '7. COMPETITIONS TABLE SCHEMA');

  // 8. Row counts
  await query(`
    SELECT 'payments' AS table_name, COUNT(*)::int AS row_count FROM payments
    UNION ALL SELECT 'users', COUNT(*)::int FROM users
    UNION ALL SELECT 'ideas', COUNT(*)::int FROM ideas
    UNION ALL SELECT 'competitions', COUNT(*)::int FROM competitions
    UNION ALL SELECT 'votes', COUNT(*)::int FROM votes
    UNION ALL SELECT 'comments', COUNT(*)::int FROM comments
    ORDER BY table_name
  `, '8. ROW COUNTS');

  // 9. ALL RLS policies on ALL tables
  await query(`
    SELECT
      nsp.nspname AS schema_name,
      cls.relname AS table_name,
      pol.polname AS policy_name,
      CASE pol.polcmd WHEN '*' THEN 'ALL' WHEN 'r' THEN 'SELECT' WHEN 'w' THEN 'UPDATE' WHEN 'a' THEN 'INSERT' WHEN 'd' THEN 'DELETE' END AS command,
      pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
      pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public'
    ORDER BY cls.relname, pol.polname
  `, '9. ALL RLS POLICIES');

  // BONUS: All constraints on payments
  await query(`
    SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public' AND tc.table_name = 'payments'
    ORDER BY tc.constraint_type, tc.constraint_name
  `, 'BONUS: ALL CONSTRAINTS ON payments');

  // BONUS: Check RLS status for all tables
  await query(`
    SELECT tablename, rowsecurity AS rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `, 'BONUS: RLS STATUS FOR ALL TABLES');

  console.log('\n' + '='.repeat(130));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(130));
}

main().catch(console.error);
