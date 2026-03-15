export type GameType = 'LOTO' | 'MAS' | 'SUPERMAS';

export interface DrawData {
  date: string;
  gameType: string;
  numbers: number[];
  bonus?: number | null;
  bonus2?: number | null;
  prize?: number | null;
}

export interface DrawWithId extends DrawData {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NumberFrequency {
  number: number;
  frequency: number;
  lastDraw: string | null;
  daysSinceLastDraw: number | null;
}

export interface Statistics {
  totalDraws: number;
  mostFrequent: NumberFrequency[];
  leastFrequent: NumberFrequency[];
  averageSum: number;
  oddEvenRatio: { odd: number; even: number };
  numberRangeDistribution: { range: string; count: number }[];
  recentDraws: DrawWithId[];
}

export interface GeneratorOptions {
  strategy: 'random' | 'hot' | 'cold' | 'mixed';
  count: number;
  gameType: GameType;
  includeBonus?: boolean;
}
