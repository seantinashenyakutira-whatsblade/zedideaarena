const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const URL = 'https://wsmrukzdfxkixlzoabvo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbXJ1a3pkZnhraXhsem9hYnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2NDI4MywiZXhwIjoyMDk0OTQwMjgzfQ.z2wALkLM2S25gjCZgJOvZdjRfN40s7Fcy1-MPEjlUcw';

const supabase = createClient(URL, KEY, { realtime: { transport: ws } });
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function getOpenApiSchema() {
  // Try various Accept headers
  for (const accept of ['application/json', 'application/openapi+json', 'text/html']) {
    const r = await fetch(`${URL}/rest/v1/`, {
      headers: { ...H, Accept }
    });
    if (r.ok) {
      const text = await r.text();
      try { return JSON.parse(text); } catch(e) { return { _raw: text.substring(0, 3000) }; }
    }
  }
  return { _error: 'all accept types failed' };
}

async function tryPgMeta() {
  const r = await fetch(`${URL}/pg/meta`, { headers: H });
  if (r.ok) return await r.json();
  return { _error: `${r.status}`, _body: await r.text().catch(() => '') };
}

async function tryPgMetaTables() {
  const r = await fetch(`${URL}/pg/meta/tables?schemas=public`, { headers: H });
  if (r.ok) return await r.json();
  return { _error: `${r.status}`, _body: await r.text().catch(() => '') };
}

async function main() {
  console.log('='.repeat(100));
  console.log('SUPABASE AUDIT - OpenAPI & PgMeta');
  console.log('='.repeat(100));

  // Try OpenAPI schema
  console.log('\n\n### OPENAPI SCHEMA ###');
  const schema = await getOpenApiSchema();
  if (schema._error) {
    console.log(`ERROR [${schema._error}]:`, schema._body?.substring(0, 300));
  } else {
    const schemas = schema.components?.schemas || {};
    const tables = Object.keys(schemas).filter(k => !k.startsWith('_'));
    console.log(`Tables in spec: ${tables.join(', ') || '(none)'}`);
    for (const t of tables) {
      const def = schemas[t];
      console.log(`\n--- ${t} ---`);
      if (def.properties) {
        for (const [col, info] of Object.entries(def.properties)) {
          const req = def.required?.includes(col) ? ' NOT NULL' : '';
          const fmt = info.format ? `(${info.format})` : '';
          const defVal = info.default !== undefined ? ` DEFAULT ${JSON.stringify(info.default)}` : '';
          const enumVals = info.enum ? ` ENUM: [${info.enum.join(', ')}]` : '';
          const ref = info['$ref'] || info.anyOf?.[0]?.['$ref'] || '';
          const refName = ref.split('/').pop();
          console.log(`  ${col}: ${info.type || refName}${fmt}${req}${defVal}${enumVals}`);
        }
      }
      console.log(`  Required: ${def.required?.join(', ') || '(none)'}`);
    }
  }

  // Try pg-meta
  console.log('\n\n### pg/meta ###');
  const meta = await tryPgMeta();
  if (meta._error) {
    console.log(`ERROR [${meta._error}]:`, meta._body?.substring(0, 200));
  } else {
    console.log(JSON.stringify(meta).substring(0, 2000));
  }

  // Try pg-meta/tables
  console.log('\n\n### pg/meta/tables ###');
  const metaTables = await tryPgMetaTables();
  if (metaTables._error) {
    console.log(`ERROR [${metaTables._error}]:`, metaTables._body?.substring(0, 500));
  } else {
    for (const t of metaTables) {
      console.log(`\n--- ${t.name} (schema: ${t.schema}) ---`);
      console.log(`  RLS: ${t.rls_enabled}`);
      console.log(`  Columns:`);
      for (const c of t.columns || []) {
        console.log(`    ${c.name}: ${c.type}${c.nullable ? '' : ' NOT NULL'}${c.default_value ? ' DEFAULT ' + c.default_value : ''}`);
      }
      console.log(`  Primary key: ${t.primary_keys?.map(pk => pk.name).join(', ') || '(none)'}`);
      console.log(`  Foreign keys: ${(t.relationships || []).map(r => r.foreign_key).join(', ') || '(none)'}`);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('DONE');
}

main().catch(console.error);
