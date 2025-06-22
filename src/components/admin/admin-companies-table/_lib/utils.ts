import { Timestamp } from 'firebase/firestore';

export function getSortableValue<T>(
  item: T,
  key: keyof T | null
): string | number | null | boolean | undefined {
  if (!key) return null;
  const value = item[key as keyof T];
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  return value as string | number | null | boolean | undefined;
}
