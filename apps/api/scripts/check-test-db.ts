import { SQL } from "bun";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is required",
  );
}

const sql = new SQL(url);

const database =
  await sql`
    select current_database() as database
  `;

const schema =
  await sql`
    select current_schema() as schema
  `;

const table =
  await sql`
    select to_regclass('public.users') as users_table
  `;

console.log({
  database:
    database[0]?.database,
  schema:
    schema[0]?.schema,
  usersTable:
    table[0]?.users_table,
});

await sql.close();