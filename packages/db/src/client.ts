import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

// postgres-js connects lazily (on first query), so instantiating the client at
// import time is build-safe. We must NOT throw on a missing DATABASE_URL here:
// the Auth.js DrizzleAdapter is constructed at module load and is pulled into
// route module graphs, so Next's page-data collection imports this file during
// `next build` (no live DB available). Fall back to a placeholder URL so the
// adapter sees a real PostgresJsDatabase instance; a real query without a valid
// DATABASE_URL will surface a clear connection error at runtime.
const connectionString =
  process.env.DATABASE_URL ?? "postgres://placeholder:placeholder@localhost:5432/placeholder";

// max:1 for serverless / edge — increase for long-running worker
const queryClient = postgres(connectionString, { max: 10 });

export const db = drizzle(queryClient, { schema });

export type DB = typeof db;
export type Transaction = Parameters<Parameters<DB["transaction"]>[0]>[0];
