import ms from 'ms';
import type { StringValue } from 'ms';

export function ttlToMs(ttl: StringValue): number {
  const value = ms(ttl);
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid TTL: "${ttl}"`);
  }
  return value;
}

export function ttlToSeconds(ttl: StringValue): number {
  return Math.floor(ttlToMs(ttl) / 1000);
}
