// src/db/index.ts
/**
 * Database module barrel export
 * 
 * This provides a clean API for importing database-related utilities
 * throughout your application.
 */

export { createDrizzleClient, getDB, schema, type Database } from './client';
export * from './schema';
