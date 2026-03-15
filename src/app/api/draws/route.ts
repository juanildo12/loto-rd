import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { GameType } from '@/types/loto';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') as GameType | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const draws = await prisma.draw.findMany({
      where: gameType ? { gameType } : undefined,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    const formatedDraws = draws.map((draw) => ({
      ...draw,
      numbers: typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers,
    }));

    return NextResponse.json(formatedDraws);
  } catch (error) {
    console.error('Error fetching draws:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draws' },
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

    const draw = await prisma.draw.upsert({
      where: {
        date_gameType: {
          date: new Date(date),
          gameType,
        },
      },
      update: {
        numbers: JSON.stringify(numbers),
        bonus,
        bonus2,
        prize,
      },
      create: {
        date: new Date(date),
        gameType,
        numbers: JSON.stringify(numbers),
        bonus,
        bonus2,
        prize,
      },
    });

    return NextResponse.json(draw);
  } catch (error) {
    console.error('Error creating draw:', error);
    return NextResponse.json(
      { error: 'Failed to create draw' },
      { status: 500 }
    );
  }
}
