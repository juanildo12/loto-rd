import { getDraws } from './supabase';

export interface GeneratorWeights {
  frequency: number;
  hotCold: number;
  parity: number;
  sum: number;
  range: number;
  recency: number;
  pairs: number;
}

export interface GeneratorOptions {
  count: number;
  gameType: 'MAS' | 'SUPERMAS';
  weights: GeneratorWeights;
  includeBonus: boolean;
}

export interface NumberScore {
  number: number;
  score: number;
  frequency: number;
  daysSinceLastDraw: number;
  isHot: boolean;
  isCold: boolean;
}

export interface GeneratedCombination {
  numbers: number[];
  bonus?: number;
  score: number;
  details: {
    avgSum: number;
    oddCount: number;
    evenCount: number;
    rangeDistribution: number[];
  };
}

const DEFAULT_WEIGHTS: GeneratorWeights = {
  frequency: 25,
  hotCold: 25,
  parity: 15,
  sum: 15,
  range: 10,
  recency: 10,
  pairs: 5,
};

const PRESETS: Record<string, GeneratorWeights> = {
  conservador: {
    frequency: 40,
    hotCold: 20,
    parity: 15,
    sum: 15,
    range: 5,
    recency: 5,
    pairs: 0,
  },
  balanceado: {
    frequency: 25,
    hotCold: 25,
    parity: 15,
    sum: 15,
    range: 10,
    recency: 5,
    pairs: 5,
  },
  agresivo: {
    frequency: 15,
    hotCold: 35,
    parity: 10,
    sum: 10,
    range: 10,
    recency: 15,
    pairs: 5,
  },
  frio: {
    frequency: 10,
    hotCold: 40,
    parity: 10,
    sum: 10,
    range: 10,
    recency: 20,
    pairs: 0,
  },
};

interface DrawData {
  numbers: number[];
  bonus?: number;
  bonus2?: number;
  date: string;
}

async function getHistoricalData(gameType: string): Promise<DrawData[]> {
  const draws = await getDraws(gameType, 200);
  return draws.map((d: any) => ({
    numbers: d.numbers,
    bonus: d.bonus,
    bonus2: d.bonus2,
    date: d.date,
  }));
}

function getFrequencyMap(draws: DrawData[]): Map<number, number> {
  const freq = new Map<number, number>();
  for (let i = 1; i <= 40; i++) freq.set(i, 0);
  
  draws.forEach(d => {
    d.numbers.forEach(n => {
      freq.set(n, (freq.get(n) || 0) + 1);
    });
  });
  return freq;
}

function getRecencyMap(draws: DrawData[]): Map<number, number> {
  const recency = new Map<number, number>();
  const now = new Date();
  
  for (let i = 1; i <= 40; i++) recency.set(i, 999);
  
  draws.forEach(d => {
    const drawDate = new Date(d.date);
    const days = Math.floor((now.getTime() - drawDate.getTime()) / (1000 * 60 * 60 * 24));
    d.numbers.forEach(n => {
      const current = recency.get(n) || 999;
      if (days < current) recency.set(n, days);
    });
  });
  return recency;
}

function getParityStats(draws: DrawData[]): { odd: number; even: number } {
  let odd = 0, even = 0;
  draws.forEach(d => {
    d.numbers.forEach(n => {
      if (n % 2 === 0) even++;
      else odd++;
    });
  });
  return { odd, even };
}

function getSumStats(draws: DrawData[]): { avg: number; std: number } {
  const sums = draws.map(d => d.numbers.reduce((a, b) => a + b, 0));
  const avg = sums.reduce((a, b) => a + b, 0) / sums.length;
  const variance = sums.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sums.length;
  return { avg, std: Math.sqrt(variance) };
}

function getRangeStats(draws: DrawData[]): Map<string, number> {
  const ranges = new Map([
    ['1-10', 0], ['11-20', 0], ['21-30', 0], ['31-40', 0]
  ]);
  
  draws.forEach(d => {
    d.numbers.forEach(n => {
      if (n >= 1 && n <= 10) ranges.set('1-10', (ranges.get('1-10') || 0) + 1);
      else if (n >= 11 && n <= 20) ranges.set('11-20', (ranges.get('11-20') || 0) + 1);
      else if (n >= 21 && n <= 30) ranges.set('21-30', (ranges.get('21-30') || 0) + 1);
      else if (n >= 31 && n <= 40) ranges.set('31-40', (ranges.get('31-40') || 0) + 1);
    });
  });
  return ranges;
}

function getNumberPairs(draws: DrawData[]): Map<string, number> {
  const pairs = new Map<string, number>();
  
  draws.forEach(d => {
    const nums = [...d.numbers].sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`;
        pairs.set(key, (pairs.get(key) || 0) + 1);
      }
    }
  });
  return pairs;
}

function normalizeWeights(weights: GeneratorWeights): GeneratorWeights {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return DEFAULT_WEIGHTS;
  
  const factor = 100 / total;
  return {
    frequency: Math.round(weights.frequency * factor),
    hotCold: Math.round(weights.hotCold * factor),
    parity: Math.round(weights.parity * factor),
    sum: Math.round(weights.sum * factor),
    range: Math.round(weights.range * factor),
    recency: Math.round(weights.recency * factor),
    pairs: Math.round(weights.pairs * factor),
  };
}

function calculateScores(
  weights: GeneratorWeights,
  frequencyMap: Map<number, number>,
  recencyMap: Map<number, number>,
  parityStats: { odd: number; even: number },
  sumStats: { avg: number; std: number },
  rangeStats: Map<string, number>,
  pairsMap: Map<string, number>,
  selectedNumbers: number[]
): NumberScore[] {
  const normalizedWeights = normalizeWeights(weights);
  
  const maxFreq = Math.max(...Array.from(frequencyMap.values()));
  const maxRecency = Math.max(...Array.from(recencyMap.values()));
  const maxRange = Math.max(...Array.from(rangeStats.values()));
  
  const scores: NumberScore[] = [];
  
  for (let n = 1; n <= 40; n++) {
    const freq = frequencyMap.get(n) || 0;
    const recency = recencyMap.get(n) || 999;
    
    const freqScore = (freq / maxFreq) * 100;
    const coldScore = ((maxRecency - recency) / maxRecency) * 100;
    const hotScore = (freq / maxFreq) * 100;
    
    const isHot = freq >= maxFreq * 0.7;
    const isCold = recency >= maxRecency * 0.7;
    
    let score = 0;
    score += normalizedWeights.frequency * (freqScore / 100);
    score += normalizedWeights.hotCold * ((isCold ? coldScore : hotScore * 0.5) / 100);
    score += normalizedWeights.recency * ((maxRecency - recency) / maxRecency);
    
    if (normalizedWeights.pairs > 0 && selectedNumbers.length > 0) {
      let pairScore = 0;
      selectedNumbers.forEach(selected => {
        const key = selected < n ? `${selected}-${n}` : `${n}-${selected}`;
        const count = pairsMap.get(key) || 0;
        pairScore += count;
      });
      const maxPair = Math.max(...Array.from(pairsMap.values())) || 1;
      score += normalizedWeights.pairs * (pairScore / (maxPair * 6));
    }
    
    scores.push({
      number: n,
      score,
      frequency: freq,
      daysSinceLastDraw: recency,
      isHot,
      isCold,
    });
  }
  
  return scores.sort((a, b) => b.score - a.score);
}

function selectNumbers(
  scores: NumberScore[],
  weights: GeneratorWeights,
  sumStats: { avg: number; std: number },
  rangeStats: Map<string, number>
): number[] {
  const selected: number[] = [];
  const maxAttempts = 100;
  
  for (let attempt = 0; attempt < maxAttempts && selected.length < 6; attempt++) {
    const candidates = scores
      .filter(s => !selected.includes(s.number))
      .sort((a, b) => b.score - a.score);
    
    if (candidates.length === 0) break;
    
    const topCandidates = candidates.slice(0, 15);
    const candidate = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    
    const testNumbers = [...selected, candidate.number];
    const testSum = testNumbers.reduce((a, b) => a + b, 0);
    const targetSum = sumStats.avg;
    const sumDeviation = Math.abs(testSum - targetSum);
    
    const rangeDist = [0, 0, 0, 0];
    testNumbers.forEach(n => {
      if (n <= 10) rangeDist[0]++;
      else if (n <= 20) rangeDist[1]++;
      else if (n <= 30) rangeDist[2]++;
      else rangeDist[3]++;
    });
    
    const minRange = Math.min(...rangeDist);
    const maxRange = Math.max(...rangeDist);
    const rangeCheck = maxRange - minRange <= 2;
    
    const parityCheck = () => {
      const odd = testNumbers.filter(n => n % 2 !== 0).length;
      return odd >= 2 && odd <= 4;
    };
    
    if (rangeCheck && parityCheck() && sumDeviation <= 40) {
      selected.push(candidate.number);
    } else if (selected.length >= 4) {
      selected.push(candidate.number);
    }
  }
  
  while (selected.length < 6) {
    const remaining = scores.filter(s => !selected.includes(s.number));
    if (remaining.length === 0) break;
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    selected.push(random.number);
  }
  
  return selected.sort((a, b) => a - b);
}

function selectBonus(bonusMap: Map<number, number>, gameType: 'MAS' | 'SUPERMAS'): { bonus: number; bonus2?: number } {
  const maxBonus = gameType === 'SUPERMAS' ? 15 : 12;
  const maxFreq = Math.max(...Array.from(bonusMap.values()));
  
  const candidates: number[] = [];
  for (let i = 1; i <= maxBonus; i++) {
    const freq = bonusMap.get(i) || 0;
    const times = Math.ceil((freq / maxFreq) * 5);
    for (let j = 0; j < times; j++) {
      candidates.push(i);
    }
  }
  
  const bonus = candidates[Math.floor(Math.random() * candidates.length)] || Math.floor(Math.random() * maxBonus) + 1;
  
  if (gameType === 'SUPERMAS') {
    const bonus2 = Math.floor(Math.random() * 15) + 1;
    return { bonus, bonus2 };
  }
  
  return { bonus };
}

export async function generateAdvanced(options: Partial<GeneratorOptions> = {}): Promise<GeneratedCombination[]> {
  const {
    count = 1,
    gameType = 'MAS',
    weights = DEFAULT_WEIGHTS,
    includeBonus = true,
  } = options;
  
  const draws = await getHistoricalData(gameType);
  
  if (draws.length === 0) {
    throw new Error('No hay datos históricos disponibles');
  }
  
  const frequencyMap = getFrequencyMap(draws);
  const recencyMap = getRecencyMap(draws);
  const parityStats = getParityStats(draws);
  const sumStats = getSumStats(draws);
  const rangeStats = getRangeStats(draws);
  const pairsMap = getNumberPairs(draws);
  
  const bonusMap = new Map<number, number>();
  draws.forEach(d => {
    if (d.bonus) {
      bonusMap.set(d.bonus, (bonusMap.get(d.bonus) || 0) + 1);
    }
  });
  
  const combinations: GeneratedCombination[] = [];
  
  for (let i = 0; i < count; i++) {
    const scores = calculateScores(
      weights,
      frequencyMap,
      recencyMap,
      parityStats,
      sumStats,
      rangeStats,
      pairsMap,
      []
    );
    
    const numbers = selectNumbers(scores, weights, sumStats, rangeStats);
    
    const sum = numbers.reduce((a, b) => a + b, 0);
    const oddCount = numbers.filter(n => n % 2 !== 0).length;
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    
    const rangeDist = [0, 0, 0, 0];
    numbers.forEach(n => {
      if (n <= 10) rangeDist[0]++;
      else if (n <= 20) rangeDist[1]++;
      else if (n <= 30) rangeDist[2]++;
      else rangeDist[3]++;
    });
    
    const avgScore = scores
      .filter(s => numbers.includes(s.number))
      .reduce((a, b) => a + b.score, 0) / 6;
    
    const result: GeneratedCombination = {
      numbers,
      score: Math.round(avgScore),
      details: {
        avgSum: sum,
        oddCount,
        evenCount,
        rangeDistribution: rangeDist,
      },
    };
    
    if (includeBonus) {
      const bonusResult = selectBonus(bonusMap, gameType);
      result.bonus = bonusResult.bonus;
      if (bonusResult.bonus2) {
        (result as any).bonus2 = bonusResult.bonus2;
      }
    }
    
    combinations.push(result);
  }
  
  return combinations;
}

export function getPresets() {
  return PRESETS;
}

export function getDefaultWeights() {
  return DEFAULT_WEIGHTS;
}
