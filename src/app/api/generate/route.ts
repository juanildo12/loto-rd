import { NextResponse } from 'next/server';
import { generateNumbers } from '@/lib/statistics';
import type { GameType } from '@/types/loto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { strategy = 'random', gameType = 'LOTO', count = 1 } = body;

    const validStrategies = ['random', 'hot', 'cold', 'mixed'];
    const validGameTypes = ['LOTO', 'MAS', 'SUPERMAS'];

    if (!validStrategies.includes(strategy)) {
      return NextResponse.json(
        { error: 'Invalid strategy. Use: random, hot, cold, or mixed' },
        { status: 400 }
      );
    }

    if (!validGameTypes.includes(gameType)) {
      return NextResponse.json(
        { error: 'Invalid gameType. Use: LOTO, MAS, or SUPERMAS' },
        { status: 400 }
      );
    }

    const combinations: { numbers: number[]; bonus?: number }[] = [];
    for (let i = 0; i < count; i++) {
      combinations.push(generateNumbers(strategy, gameType as GameType));
    }

    return NextResponse.json({
      strategy,
      gameType,
      combinations,
    });
  } catch (error) {
    console.error('Error generating numbers:', error);
    return NextResponse.json(
      { error: 'Failed to generate numbers' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to generate numbers',
    body: {
      strategy: 'random', // random, hot, cold, mixed
      gameType: 'LOTO', // LOTO, MAS, SUPERMAS
      count: 1, // number of combinations
    },
  });
}
