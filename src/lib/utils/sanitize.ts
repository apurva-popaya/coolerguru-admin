export function sanitizeText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\0/g, "")
    .trim();
}

export function sanitizeOptionalText(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const sanitized = sanitizeText(value);

  return sanitized || null;
}

export function sanitizeStringArray(values: string[]): string[] {
  return values.map((value) => sanitizeText(value)).filter(Boolean);
}
