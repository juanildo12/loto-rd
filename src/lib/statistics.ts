import type { DrawWithId, GameType, NumberFrequency, Statistics } from '@/types/loto';

export function calculateFrequencies(draws: DrawWithId[]): Map<number, { count: number; lastDate: Date | string | null }> {
  const frequencies = new Map<number, { count: number; lastDate: Date | string | null }>();

  // Initialize all numbers 1-40 with 0 frequency
  for (let i = 1; i <= 40; i++) {
    frequencies.set(i, { count: 0, lastDate: null });
  }

  // Count frequencies
  draws.forEach((draw) => {
    draw.numbers.forEach((num) => {
      const current = frequencies.get(num)!;
      frequencies.set(num, {
        count: current.count + 1,
        lastDate: draw.date,
      });
    });
  });

  return frequencies;
}

export function getNumberFrequencyList(draws: DrawWithId[]): NumberFrequency[] {
  const frequencies = calculateFrequencies(draws);
  const now = new Date();

  const result: NumberFrequency[] = [];

  frequencies.forEach((value, number) => {
    let daysSinceLastDraw: number | null = null;
    if (value.lastDate) {
      const lastDate = new Date(value.lastDate);
      const diffTime = now.getTime() - lastDate.getTime();
      daysSinceLastDraw = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    result.push({
      number,
      frequency: value.count,
      lastDraw: value.lastDate ? new Date(value.lastDate).toISOString().split('T')[0] : null,
      daysSinceLastDraw,
    });
  });

  return result.sort((a, b) => b.frequency - a.frequency);
}

export function getMostFrequent(draws: DrawWithId[], limit: number = 10): NumberFrequency[] {
  return getNumberFrequencyList(draws).slice(0, limit);
}

export function getLeastFrequent(draws: DrawWithId[], limit: number = 10): NumberFrequency[] {
  return getNumberFrequencyList(draws).slice(-limit).reverse();
}

export function getAverageSum(draws: DrawWithId[]): number {
  if (draws.length === 0) return 0;
  const totalSum = draws.reduce((sum, draw) => {
    return sum + draw.numbers.reduce((nSum, num) => nSum + num, 0);
  }, 0);
  return Math.round(totalSum / draws.length);
}

export function getOddEvenRatio(draws: DrawWithId[]): { odd: number; even: number } {
  let odd = 0;
  let even = 0;

  draws.forEach((draw) => {
    draw.numbers.forEach((num) => {
      if (num % 2 === 0) {
        even++;
      } else {
        odd++;
      }
    });
  });

  return { odd, even };
}

export function getNumberRangeDistribution(draws: DrawWithId[]): { range: string; count: number }[] {
  const ranges = [
    { range: '1-10', min: 1, max: 10 },
    { range: '11-20', min: 11, max: 20 },
    { range: '21-30', min: 21, max: 30 },
    { range: '31-40', min: 31, max: 40 },
  ];

  const distribution = ranges.map((r) => ({ range: r.range, count: 0 }));

  draws.forEach((draw) => {
    draw.numbers.forEach((num) => {
      const rangeIndex = ranges.findIndex((r) => num >= r.min && num <= r.max);
      if (rangeIndex !== -1) {
        distribution[rangeIndex].count++;
      }
    });
  });

  return distribution;
}

export function getStatistics(draws: DrawWithId[]): Statistics {
  return {
    totalDraws: draws.length,
    mostFrequent: getMostFrequent(draws, 10),
    leastFrequent: getLeastFrequent(draws, 10),
    averageSum: getAverageSum(draws),
    oddEvenRatio: getOddEvenRatio(draws),
    numberRangeDistribution: getNumberRangeDistribution(draws),
    recentDraws: draws.slice(0, 10),
  };
}

export function generateNumbers(
  strategy: 'random' | 'hot' | 'cold' | 'mixed',
  gameType: GameType = 'LOTO'
): { numbers: number[]; bonus?: number } {
  const frequencies = new Map<number, number>();
  
  // This would be populated from actual data in production
  // For now, we'll use a weighted random approach
  
  let selectedNumbers: number[] = [];

  switch (strategy) {
    case 'random':
      selectedNumbers = generateRandomNumbers();
      break;
    case 'hot':
      selectedNumbers = generateFromFrequencies(true);
      break;
    case 'cold':
      selectedNumbers = generateFromFrequencies(false);
      break;
    case 'mixed':
      selectedNumbers = generateMixedNumbers();
      break;
    default:
      selectedNumbers = generateRandomNumbers();
  }

  const result: { numbers: number[]; bonus?: number } = { numbers: selectedNumbers };

  if (gameType === 'MAS' || gameType === 'SUPERMAS') {
    result.bonus = Math.floor(Math.random() * 12) + 1;
  }

  return result;
}

function generateRandomNumbers(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 6) {
    const num = Math.floor(Math.random() * 40) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

function generateFromFrequencies(hot: boolean): number[] {
  // Generate based on historical frequencies
  // In production, this would use actual frequency data
  const numbers: number[] = [];
  const baseNumbers = hot 
    ? [28, 20, 5, 10, 19, 15, 37, 1, 22, 12] // Sample hot numbers
    : [40, 39, 38, 36, 35, 34, 33, 32, 31, 30]; // Sample cold numbers
  
  while (numbers.length < 6) {
    const num = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

function generateMixedNumbers(): number[] {
  const numbers: number[] = [];
  const hot = [28, 20, 5, 10, 19, 15, 37, 1, 22, 12];
  const cold = [40, 39, 38, 36, 35, 34, 33, 32, 31, 30];
  const all = [...hot, ...cold];
  
  while (numbers.length < 6) {
    const num = all[Math.floor(Math.random() * all.length)];
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}
