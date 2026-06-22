require('dotenv').config({ quiet: true });

const db = require('../src/config/db');

async function inspectDatabase() {
  const tablesResult = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  if (tablesResult.rows.length === 0) {
    console.log('No hay tablas creadas en el esquema public.');
    return;
  }

  for (const table of tablesResult.rows) {
    const columnsResult = await db.query(
      `
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position;
      `,
      [table.table_name]
    );

    console.log(`\nTabla: ${table.table_name}`);

    columnsResult.rows.forEach((column) => {
      const length = column.character_maximum_length
        ? `(${column.character_maximum_length})`
        : '';
      const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultValue = column.column_default
        ? ` DEFAULT ${column.column_default}`
        : '';

      console.log(
        `- ${column.column_name}: ${column.data_type}${length} ${nullable}${defaultValue}`
      );
    });

    const constraintsResult = await db.query(
      `
        SELECT tc.constraint_name, tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
          AND tc.table_name = $1
        ORDER BY tc.constraint_type, tc.constraint_name;
      `,
      [table.table_name]
    );

    if (constraintsResult.rows.length > 0) {
      console.log('Restricciones:');

      constraintsResult.rows.forEach((constraint) => {
        console.log(`- ${constraint.constraint_type}: ${constraint.constraint_name}`);
      });
    }
  }
}

inspectDatabase()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
