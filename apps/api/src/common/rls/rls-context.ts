import { AsyncLocalStorage } from 'async_hooks';

export interface RlsStore {
  userId: string;
  role: string;
}

/**
 * Request-scoped AsyncLocalStorage that carries the authenticated user's
 * identity into every TypeORM query so PostgreSQL RLS policies can enforce
 * row-level isolation automatically.
 *
 * HTTP requests populate this via RlsInterceptor (runs after JwtAuthGuard).
 * Background jobs/processors that need unrestricted DB access should call
 * runAsSystem() to mark themselves as trusted system operations.
 */
export const rlsContext = new AsyncLocalStorage<RlsStore>();

/**
 * Runs a callback with a "system" identity so RLS policies grant full
 * access. Use this in Bull processors, event listeners, and scheduled tasks
 * that need to read or write rows across multiple users.
 */
export function runAsSystem<T>(fn: () => Promise<T>): Promise<T> {
  return rlsContext.run({ userId: 'system', role: 'system' }, fn);
}
