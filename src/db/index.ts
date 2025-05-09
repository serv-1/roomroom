import { Pool, QueryArrayConfig, QueryConfig, QueryResultRow } from "pg";
import env from "../env";

export const pool = new Pool({
  connectionString: env.PG_CONN_STR,
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
