import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema/index.js';
import path from 'path';

export const client = createClient({ url: 'file:sqlite.db' });
export const db = drizzle(client, { schema });

export * from './schema/index.js';
