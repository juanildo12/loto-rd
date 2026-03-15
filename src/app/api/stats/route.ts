import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getStatistics, getNumberFrequencyList } from '@/lib/statistics';
import type { GameType } from '@/types/loto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') as GameType | null;
    const limit = parseInt(searchParams.get('limit') || '200');

    const draws = await prisma.draw.findMany({
      where: gameType ? { gameType } : undefined,
      orderBy: { date: 'desc' },
      take: limit,
    });

    const formatedDraws = draws.map((draw) => ({
      ...draw,
      date: draw.date.toISOString(),
      createdAt: draw.createdAt.toISOString(),
      updatedAt: draw.updatedAt.toISOString(),
      numbers: typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers,
    }));

    const stats = getStatistics(formatedDraws);
    const frequencies = getNumberFrequencyList(formatedDraws);

    return NextResponse.json({
      statistics: stats,
      frequencies,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
