const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const URL = 'https://wsmrukzdfxkixlzoabvo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbXJ1a3pkZnhraXhsem9hYnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2NDI4MywiZXhwIjoyMDk0OTQwMjgzfQ.z2wALkLM2S25gjCZgJOvZdjRfN40s7Fcy1-MPEjlUcw';

const supabase = createClient(URL, KEY, { realtime: { transport: ws } });
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function fetchOpenApiSpec() {
  const r = await fetch(`${URL}/rest/v1/`, {
    headers: { ...H, Accept: 'application/json' }
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  return await r.json();
}

function parseDefinitions(spec) {
  const defs = spec.definitions || {};
  const tables = {};

  for (const [name, def] of Object.entries(defs)) {
    const props = def.properties || {};
    const required = def.required || [];
    const columns = [];

    // Also parse from the path parameters for more detail
    for (const [colName, colDef] of Object.entries(props)) {
      const isRequired = required.includes(colName);
      let type = colDef.type || 'unknown';
      let format = colDef.format || '';
      let defaultValue = colDef.default;
      let enumValues = colDef.enum;
      let maxLength = colDef.maxLength;
      let ref = '';

      // Handle $ref references
      if (colDef.$ref) {
        ref = colDef.$ref.split('/').pop();
        type = ref;
      }
      // Handle oneOf with refs
      if (colDef.oneOf || colDef.anyOf) {
        const alternatives = colDef.oneOf || colDef.anyOf || [];
        const refAlt = alternatives.find(a => a.$ref);
        if (refAlt) {
          ref = refAlt.$ref.split('/').pop();
        }
      }

      columns.push({
        name: colName,
        type,
        format,
        maxLength,
        nullable: !isRequired,
        defaultValue: defaultValue !== undefined ? JSON.stringify(defaultValue) : null,
        enum: enumValues || null,
        ref
      });
    }

    tables[name] = { columns, required };
  }

  return tables;
}

function parsePathsForFks(spec, tables) {
  // Extract foreign keys from path parameter descriptions
  const paths = spec.paths || {};
  // PostgREST includes foreign key info in the rowFilter parameters
  // Look for parameters like rowFilter.table_name.column_name
  const params = spec.parameters || {};

  const fkMap = {};

  for (const [paramName, paramDef] of Object.entries(params)) {
    // Match pattern: rowFilter.<table>.<column>
    const match = paramName.match(/^rowFilter\.(\w+)\.(\w+)$/);
    if (!match) continue;
    const tableName = match[1];
    // Check description for FK hints
    const desc = paramDef.description || '';
    // PostgREST doesn't always embed FK info in the OpenAPI spec
    // But we can look at the path definitions
  }

  // Parse paths for FK info embedded in descriptions or schema
  for (const [path, methods] of Object.entries(paths)) {
    const pathMatch = path.match(/^\/(\w+)$/);
    if (!pathMatch) continue;
    const tableName = pathMatch[1];
    if (!tables[tableName]) continue;

    // Check if there's a description with foreign key info
    // Check PATCH method which often has the schema with FK info
    const patchMethod = methods.patch;
    if (patchMethod && patchMethod.parameters) {
      for (const param of patchMethod.parameters) {
        const ref = param.schema?.$ref || param.$ref;
        if (ref) {
          const defName = ref.split('/').pop();
          // If this is a different table's definition, it could be an FK relationship
        }
      }
    }
  }

  return fkMap;
}

function getFkFromSchema(spec) {
  // PostgREST v10+ includes foreign keys in the OpenAPI spec
  // Look for x-foreign-key or foreignKey in definitions
  const defs = spec.definitions || {};
  const results = [];

  for (const [tableName, def] of Object.entries(defs)) {
    const fks = def.foreignKeys || def['x-foreign-keys'] || [];
    for (const fk of fks) {
      results.push({
        table: tableName,
        columns: fk.columns || fk.local_columns || [],
        foreignTable: fk.referencedTable || fk.foreign_table || '',
        foreignColumns: fk.referencedColumns || fk.foreign_columns || []
      });
    }
  }

  return results;
}

function getTriggersFromSchema(spec) {
  // Return empty - OpenAPI doesn't have trigger info
  return [];
}

async function getRowCount(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  if (error) return { error: error.message };
  return count;
}

async function getSample(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(3);
  if (error) return { error: error.message };
  return data || [];
}

async function main() {
  console.log('='.repeat(130));
  console.log('SUPABASE DATABASE AUDIT - COMPLETE');
  console.log('Date: ' + new Date().toISOString());
  console.log('='.repeat(130));

  // Fetch OpenAPI spec
  console.log('\n\nFetching OpenAPI schema...');
  const spec = await fetchOpenApiSpec();
  console.log(`OpenAPI spec loaded (${JSON.stringify(spec).length} bytes)`);

  // Parse all table definitions
  const tables = parseDefinitions(spec);
  const fks = getFkFromSchema(spec);
  const trigs = getTriggersFromSchema(spec);

  console.log(`\nFound ${Object.keys(tables).length} tables in spec: ${Object.keys(tables).join(', ')}`);

  // Track RLS status
  const rlsStatus = {};

  // 1. Payments table schema (detailed)
  console.log('\n\n### 1. PAYMENTS TABLE SCHEMA ###');
  const payDef = tables.payments;
  if (payDef) {
    console.log('Columns:');
    for (const c of payDef.columns) {
      console.log(`  ${c.name}: ${c.type}${c.format ? ' (' + c.format + ')' : ''}${c.ref ? ' -> ' + c.ref : ''}${c.nullable ? '' : ' NOT NULL'}${c.defaultValue ? ' DEFAULT ' + c.defaultValue : ''}${c.enum ? ' ENUM: [' + c.enum.join(', ') + ']' : ''}`);
    }
    console.log(`Required: ${payDef.required.join(', ') || '(none)'}`);
  } else {
    console.log('(payments table not found in OpenAPI spec!)');
  }

  // 2. RLS on payments
  console.log('\n\n### 2. RLS ON payments ###');
  rlsStatus.payments = 'unknown (cannot query pg_catalog)';

  // 3. ALL tables
  console.log('\n\n### 3. ALL TABLES ###');
  console.log(Object.keys(tables).join('\n'));

  // 4. Users table
  console.log('\n\n### 4. USERS TABLE SCHEMA ###');
  const userDef = tables.users;
  if (userDef) {
    console.log('Columns:');
    for (const c of userDef.columns) {
      console.log(`  ${c.name}: ${c.type}${c.format ? ' (' + c.format + ')' : ''}${c.ref ? ' -> ' + c.ref : ''}${c.nullable ? '' : ' NOT NULL'}${c.defaultValue ? ' DEFAULT ' + c.defaultValue : ''}${c.enum ? ' ENUM: [' + c.enum.join(', ') + ']' : ''}`);
    }
    console.log(`Required: ${userDef.required.join(', ') || '(none)'}`);
  }

  // 5. Ideas table
  console.log('\n\n### 5. IDEAS TABLE SCHEMA ###');
  const ideaDef = tables.ideas;
  if (ideaDef) {
    console.log('Columns:');
    for (const c of ideaDef.columns) {
      console.log(`  ${c.name}: ${c.type}${c.format ? ' (' + c.format + ')' : ''}${c.ref ? ' -> ' + c.ref : ''}${c.nullable ? '' : ' NOT NULL'}${c.defaultValue ? ' DEFAULT ' + c.defaultValue : ''}${c.enum ? ' ENUM: [' + c.enum.join(', ') + ']' : ''}`);
    }
    console.log(`Required: ${ideaDef.required.join(', ') || '(none)'}`);
  }

  // 6. Triggers & Foreign Keys
  console.log('\n\n### 6. FOREIGN KEYS ###');
  if (fks.length > 0) {
    for (const fk of fks) {
      console.log(`  ${fk.table}(${fk.columns.join(',')}) -> ${fk.foreignTable}(${fk.foreignColumns.join(',')})`);
    }
  } else {
    console.log('(foreign keys not exposed in this OpenAPI spec format)');
    // PostgREST doesn't expose FK info in the standard OpenAPI spec
    // Try to infer from column refs
    console.log('Inferred FK references from column types:');
    for (const [tName, tDef] of Object.entries(tables)) {
      for (const c of tDef.columns) {
        if (c.ref) {
          console.log(`  ${tName}.${c.name} -> ${c.ref}`);
        }
      }
    }
  }

  console.log('\nTriggers: (cannot query - no raw SQL access)');

  // 7. Competitions table
  console.log('\n\n### 7. COMPETITIONS TABLE SCHEMA ###');
  const compDef = tables.competitions;
  if (compDef) {
    console.log('Columns:');
    for (const c of compDef.columns) {
      console.log(`  ${c.name}: ${c.type}${c.format ? ' (' + c.format + ')' : ''}${c.ref ? ' -> ' + c.ref : ''}${c.nullable ? '' : ' NOT NULL'}${c.defaultValue ? ' DEFAULT ' + c.defaultValue : ''}${c.enum ? ' ENUM: [' + c.enum.join(', ') + ']' : ''}`);
    }
    console.log(`Required: ${compDef.required.join(', ') || '(none)'}`);
  }

  // 8. Row Counts (actual query)
  console.log('\n\n### 8. ROW COUNTS ###');
  for (const t of Object.keys(tables)) {
    const cnt = await getRowCount(t);
    console.log(`  ${t}: ${cnt && cnt.error ? 'ERROR: ' + cnt.error : cnt}`);
  }

  // 9. Additional tables
  console.log('\n\n### 9. ALL TABLE DEFINITIONS ###');
  for (const [tName, tDef] of Object.entries(tables)) {
    if (['payments', 'users', 'ideas', 'competitions'].includes(tName)) continue;
    console.log(`\n--- ${tName} ---`);
    for (const c of tDef.columns) {
      console.log(`  ${c.name}: ${c.type}${c.format ? ' (' + c.format + ')' : ''}${c.ref ? ' -> ' + c.ref : ''}${c.nullable ? '' : ' NOT NULL'}${c.defaultValue ? ' DEFAULT ' + c.defaultValue : ''}${c.enum ? ' [' + c.enum.join(', ') + ']' : ''}`);
    }
    const cnt = await getRowCount(tName);
    console.log(`  Row count: ${cnt && cnt.error ? cnt.error : cnt}`);
  }

  console.log('\n' + '='.repeat(130));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(130));
}

main().catch(console.error);
