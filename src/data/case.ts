const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
const snake = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/** Converts a database row (snake_case) to an app object (camelCase). */
export function toCamel<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [camel(k), v])) as T;
}

/** Converts an app object (camelCase) to a database row (snake_case), dropping undefined values. */
export function toSnake(obj: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [snake(k), v]),
  );
}
