import * as cheerio from 'cheerio';
import type { DrawData, GameType } from '@/types/loto';

const BASE_URL = 'https://www.yelu.do/leidsa/results';

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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseGameType(gameTypeStr: string): GameType {
  const type = gameTypeStr.toLowerCase();
  if (type.includes('mas') && !type.includes('super')) return 'MAS';
  if (type.includes('super')) return 'SUPERMAS';
  return 'LOTO';
}

function parseNumbers(text: string): number[] {
  const numbers: number[] = [];
  const matches = text.match(/\d+/g);
  if (matches) {
    matches.forEach((m) => {
      const num = parseInt(m, 10);
      if (num >= 1 && num <= 40 && !numbers.includes(num)) {
        numbers.push(num);
      } else if (num >= 1 && num <= 15 && numbers.length >= 6 && numbers.length <= 7) {
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
    });
  }
  return numbers;
}

export async function scrapeLotoResults(
  year: number,
  month: number,
  gameType: GameType = 'LOTO'
): Promise<ParsedDraw[]> {
  const results: ParsedDraw[] = [];
  
  const gameMap: Record<GameType, string> = {
    LOTO: 'loto',
    MAS: 'loto-mas',
    SUPERMAS: 'loto-mas',
  };

  const url = `${BASE_URL}/${gameMap[gameType]}?month=${year}-${String(month).padStart(2, '0')}`;
  
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    $('tbody tr, .result-row, .draw-row').each((_, row) => {
      const $row = $(row);
      const dateText = $row.find('td:first-child, .date, .draw-date').text().trim();
      const numbersText = $row.find('td:nth-child(2), .numbers, .draw-numbers').text().trim();
      const prizeText = $row.find('.prize, .monto').text().trim();

      if (dateText && numbersText) {
        const numbers = parseNumbers(numbersText);
        
        let parsedDate: Date | null = null;
        
        // Try to parse various date formats
        const dateMatch = dateText.match(/(\d{1,2})\s+de\s+(\w+)\s+(\d{4})/);
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const monthName = dateMatch[2];
          const yearNum = parseInt(dateMatch[3]);
          const monthIndex = monthNames.findIndex(m => 
            m.toLowerCase() === monthName.toLowerCase()
          );
          if (monthIndex !== -1) {
            parsedDate = new Date(yearNum, monthIndex, day);
          }
        }

        if (parsedDate && numbers.length >= 6) {
          let bonus: number | undefined;
          let bonus2: number | undefined;

          if (gameType === 'MAS' && numbers.length >= 7) {
            bonus = numbers[6];
          } else if (gameType === 'SUPERMAS' && numbers.length >= 8) {
            bonus = numbers[6];
            bonus2 = numbers[7];
          }

          const prize = prizeText ? parseFloat(prizeText.replace(/[RD$\s.,]/g, '')) / 1000000 : undefined;

          results.push({
            date: parsedDate.toISOString().split('T')[0],
            numbers: numbers.slice(0, 6),
            bonus,
            bonus2,
            gameType,
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }

  return results;
}

export async function scrapeAllResults(
  year: number,
  month: number
): Promise<ParsedDraw[]> {
  const allResults: ParsedDraw[] = [];
  
  const gameTypes: GameType[] = ['LOTO', 'MAS'];
  
  for (const gameType of gameTypes) {
    try {
      const results = await scrapeLotoResults(year, month, gameType);
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
