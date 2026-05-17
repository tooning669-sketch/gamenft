import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getPlayerState, savePlayerState } from '@/lib/dbConfig';

// GET /api/player — load player state
export async function GET() {
  try {
    await initDatabase();
    const state = await getPlayerState();
    return NextResponse.json({ data: state });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/player — save player state
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    const body = await request.json();
    await savePlayerState(body);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
