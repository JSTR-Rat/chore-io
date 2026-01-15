// src/env.d.ts
/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare D1 Database Binding
 * This type is provided by @cloudflare/workers-types
 */
export type D1Database = D1Database;

/**
 * Cloudflare Environment Bindings
 * These are the bindings defined in wrangler.jsonc
 */
export interface Env {
  DB: D1Database;
}

/**
 * Extend TanStack Start's context with Cloudflare bindings
 * This makes the bindings available in server functions
 */
declare module '@tanstack/react-start/server' {
  interface RequestEventBase {
    cloudflare?: {
      request?: Request;
      env?: Env;
      ctx?: ExecutionContext;
    };
  }
}
