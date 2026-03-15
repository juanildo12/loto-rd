import * as cheerio from 'cheerio';
import type { GameType } from '@/types/loto';

const BASE_URL = 'https://enloteria.com';

interface ParsedDraw {
  date: string;
  numbers: number[];
  bonus?: number;
  bonus2?: number;
  gameType: GameType;
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  return response.text();
}

function extractNumbersFromDescription(description: string): number[] {
  const numbers: number[] = [];
  const matches = description.match(/\d+/g);
  if (matches) {
    for (const m of matches) {
      const num = parseInt(m, 10);
      if (num >= 1 && num <= 40 && !numbers.includes(num)) {
        numbers.push(num);
      }
    }
  }
  return numbers.slice(0, 6);
}

function parseDateFromUrl(url: string): string | null {
  const match = url.match(/resultados-loto(?:-mas)?-(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return null;
}

export async function scrapeLotoResults(gameType: GameType = 'LOTO'): Promise<ParsedDraw[]> {
  const results: ParsedDraw[] = [];
  
  const gamePaths: Record<GameType, string> = {
    LOTO: '/resultados-loto',
    MAS: '/resultados-loto-mas',
    SUPERMAS: '/resultados-loto-mas',
  };

  const url = `${BASE_URL}${gamePaths[gameType]}`;
  
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const scriptTags = $('script[type="application/ld+json"]');
    
    scriptTags.each((_, el) => {
      try {
        const jsonContent = $(el).html();
        if (!jsonContent) return;
        
        const data = JSON.parse(jsonContent);
        const events = Array.isArray(data) ? data : (data['@graph'] || [data]);
        
        for (const event of events) {
          if (event['@type'] === 'Event' && event.name?.includes('Loto')) {
            const url = event.url;
            const description = event.description || '';
            const numbers = extractNumbersFromDescription(description);
            
            const date = parseDateFromUrl(url);
            
            if (date && numbers.length >= 6) {
              results.push({
                date,
                numbers,
                gameType,
              });
            }
          }
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }

  return results;
}

export async function scrapeAllResults(): Promise<ParsedDraw[]> {
  const allResults: ParsedDraw[] = [];
  
  const gameTypes: GameType[] = ['LOTO', 'MAS'];
  
  for (const gameType of gameTypes) {
    try {
      const results = await scrapeLotoResults(gameType);
      allResults.push(...results);
    } catch (error) {
      console.error(`Error scraping ${gameType}:`, error);
    }
  }

  return allResults;
}

export async function getAvailableMonths(): Promise<{ year: number; month: number }[]> {
  const available: { year: number; month: number }[] = [];
  const currentDate = new Date();
  const startYear = 2022;

  for (let year = currentDate.getFullYear(); year >= startYear; year--) {
    const monthsToCheck = year === currentDate.getFullYear() 
      ? currentDate.getMonth() + 1 
      : 12;
    
    for (let month = 1; month <= monthsToCheck; month++) {
      available.push({ year, month });
    }
  }

  return available;
}
