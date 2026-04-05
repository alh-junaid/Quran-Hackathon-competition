import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Allow missing DB locally so the UI can run without crashing the whole node layer
export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://noop:noop@localhost:5432/noop" });
export const db = drizzle(pool, { schema });

export * from "./schema";
