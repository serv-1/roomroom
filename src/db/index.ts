import { Pool, QueryArrayConfig, QueryConfig, QueryResultRow } from "pg";
import env from "../env";
import { readFileSync } from "fs";

export const pool = new Pool({
  user: env.PG_USER,
  host: env.PG_HOST,
  database: env.PG_DATABASE,
  password: env.PG_PASSWORD,
  port: +env.PG_PORT,
  ssl: {
    ca: readFileSync("src/db/ca.crt").toString(),
  },
});

export const query = async <
  R extends QueryResultRow,
  I extends unknown[] = unknown[],
>(
  queryTextOrConfig: string | QueryConfig<I> | QueryArrayConfig<I>,
  values?: I,
) => {
  return await pool.query<R, I>(queryTextOrConfig, values);
};

export default {
  pool,
  query,
};
