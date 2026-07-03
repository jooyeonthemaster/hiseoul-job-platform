// Tiny classname combiner (no external deps). Filters falsy values and joins.
export type ClassValue = string | number | null | false | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
