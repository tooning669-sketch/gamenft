// Shared API helpers for admin tabs

export async function fetchConfig(): Promise<Record<string, unknown>> {
  const res = await fetch('/api/admin/config');
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function saveConfig(key: string, value: unknown): Promise<void> {
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save');
  }
}
