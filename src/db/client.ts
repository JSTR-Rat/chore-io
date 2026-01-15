// src/db/client.ts
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { env } from 'cloudflare:workers';
import * as schema from './schema/';
import type { D1Database } from '../env';

/**
 * Type alias for the Drizzle database instance with our schema
 */
export type Database = DrizzleD1Database<typeof schema>;

/**
 * Initialize Drizzle with a D1 database binding
 * 
 * @param d1 - The D1 database binding from the Cloudflare environment
 * @returns A Drizzle database instance with full schema typing
 * 
 * @example
 * ```ts
 * const db = createDrizzleClient(env.DB);
 * const users = await db.select().from(schema.users);
 * ```
 */
export function createDrizzleClient(d1: D1Database): Database {
  return drizzle(d1, { schema });
}

/**
 * Helper function to get the database client
 * 
 * Uses Cloudflare's virtual module to access D1 binding.
 * 
 * @returns A Drizzle database instance
 * @throws {Error} If the D1 binding is not available
 * 
 * @example Server Route
 * ```ts
 * export const Route = createFileRoute('/api/users')({
 *   server: {
 *     handlers: {
 *       GET: async () => {
 *         const db = getDB();
 *         const users = await db.select().from(users);
 *         return Response.json(users);
 *       },
 *     },
 *   },
 * });
 * ```
 * 
 * @example Server Function
 * ```ts
 * export const getUsers = createServerFn({ method: 'GET' }).handler(async () => {
 *   const db = getDB();
 *   return await db.select().from(users);
 * });
 * ```
 * 
 * @see https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/
 */
export function getDB(): Database {
  if (!env.DB) {
    throw new Error(
      'D1 binding not found. Ensure wrangler.jsonc is configured correctly:\n\n' +
      '{\n' +
      '  "d1_databases": [{\n' +
      '    "binding": "DB",\n' +
      '    "database_name": "your-db-name",\n' +
      '    "database_id": "your-db-id"\n' +
      '  }]\n' +
      '}\n\n' +
      'Then restart your dev server: pnpm dev'
    );
  }

  return createDrizzleClient(env.DB);
}

// Re-export schema for convenience
export { schema };
