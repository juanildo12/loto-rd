import { NextResponse } from 'next/server';
import { getDraws, createDraw } from '@/lib/supabase';
import type { GameType } from '@/types/loto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') as GameType | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    const draws = await getDraws(gameType || undefined, limit);

    const formatedDraws = draws.map((draw: any) => ({
      ...draw,
      numbers: typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers,
    }));

    return NextResponse.json(formatedDraws);
  } catch (error) {
    console.error('Error fetching draws:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draws', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, gameType, numbers, bonus, bonus2, prize } = body;

    if (!date || !gameType || !numbers || numbers.length < 6) {
      return NextResponse.json(
        { error: 'Invalid data. Required: date, gameType, numbers (6)' },
        { status: 400 }
      );
    }

    const result = await createDraw({ date, gameType, numbers, bonus, bonus2 });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating draw:', error);
    return NextResponse.json(
      { error: 'Failed to create draw', details: String(error) },
      { status: 500 }
    );
  }
}
