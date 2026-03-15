import { NextResponse } from 'next/server';
import { generateAdvanced, getPresets, getDefaultWeights, type GeneratorWeights } from '@/lib/advancedGenerator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      strategy = 'advanced',
      gameType = 'MAS', 
      count = 1,
      weights,
      includeBonus = true,
      preset 
    } = body;

    const validGameTypes = ['MAS', 'SUPERMAS'];
    const validPresets = ['conservador', 'balanceado', 'agresivo', 'frio'];

    if (!validGameTypes.includes(gameType)) {
      return NextResponse.json(
        { error: 'Invalid gameType. Use: MAS or SUPERMAS' },
        { status: 400 }
      );
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 20' },
        { status: 400 }
      );
    }

    let finalWeights: GeneratorWeights;
    
    if (preset && validPresets.includes(preset)) {
      finalWeights = getPresets()[preset];
    } else if (weights) {
      finalWeights = {
        frequency: weights.frequency ?? 25,
        hotCold: weights.hotCold ?? 25,
        parity: weights.parity ?? 15,
        sum: weights.sum ?? 15,
        range: weights.range ?? 10,
        recency: weights.recency ?? 10,
        pairs: weights.pairs ?? 5,
      };
    } else if (strategy === 'random') {
      finalWeights = getDefaultWeights();
    } else {
      finalWeights = getDefaultWeights();
    }

    const combinations = await generateAdvanced({
      count,
      gameType,
      weights: finalWeights,
      includeBonus,
    });

    return NextResponse.json({
      strategy: preset || 'personalizado',
      gameType,
      weights: finalWeights,
      combinations,
      totalGenerated: combinations.length,
    });
  } catch (error) {
    console.error('Error generating numbers:', error);
    return NextResponse.json(
      { error: 'Failed to generate numbers', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to generate numbers',
    presets: Object.keys(getPresets()),
    weights: getDefaultWeights(),
    example: {
      strategy: 'advanced',
      gameType: 'MAS',
      count: 1,
      preset: 'balanceado',
      weights: {
        frequency: 25,
        hotCold: 25,
        parity: 15,
        sum: 15,
        range: 10,
        recency: 10,
        pairs: 5,
      },
      includeBonus: true,
    },
  });
}
