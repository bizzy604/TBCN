export function createCheckoutIdempotencyKey(scope: string, subject: string): string {
  const randomPart = (() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().replace(/-/g, '');
    }
    return `${Date.now()}${Math.random().toString(36).slice(2, 12)}`;
  })();

  return `${scope}:${subject}:${randomPart}`.slice(0, 120);
}
