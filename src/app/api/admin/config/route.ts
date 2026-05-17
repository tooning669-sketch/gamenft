import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getAllConfig, setConfig } from '@/lib/dbConfig';

// GET /api/admin/config — return all config
export async function GET() {
  try {
    await initDatabase();
    const config = await getAllConfig();
    return NextResponse.json(config);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/config — update a config section
// Body: { key: string, value: any }
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
    }

    await setConfig(key, value);
    return NextResponse.json({ success: true, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
