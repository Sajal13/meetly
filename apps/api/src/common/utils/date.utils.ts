export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function toUtcIso(date: Date): string {
  return date.toISOString();
}
