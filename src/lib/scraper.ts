import * as cheerio from 'cheerio';
import type { DrawData, GameType } from '@/types/loto';

const BASE_URL = 'https://www.yelu.do';

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

function parseNumbersFromTitle(title: string): number[] {
  const numbers: number[] = [];
  const cleanTitle = title.replace(/[-+]/, '-');
  const parts = cleanTitle.split('-');
  
  for (const part of parts) {
    const num = parseInt(part.trim(), 10);
    if (num >= 1 && num <= 40 && !numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers;
}

function parseDate(dateStr: string): string | null {
  const monthNames: Record<string, number> = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
    'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
    'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
  };
  
  const match = dateStr.match(/(\d+)\s+de\s+(\w+)\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = monthNames[match[2].toLowerCase()];
    const year = parseInt(match[3], 10);
    if (month !== undefined) {
      const date = new Date(year, month, day);
      return date.toISOString().split('T')[0];
    }
  }
  return null;
}

export async function scrapeLotoResults(
  year: number,
  month: number,
  gameType: GameType = 'LOTO'
): Promise<ParsedDraw[]> {
  const results: ParsedDraw[] = [];
  
  const gamePaths: Record<GameType, string> = {
    LOTO: '/leidsa/results/loto',
    MAS: '/leidsa/results/loto-mas',
    SUPERMAS: '/leidsa/results/loto-mas',
  };

  const url = `${BASE_URL}${gamePaths[gameType]}?month=${year}-${String(month).padStart(2, '0')}`;
  
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    $('tr').each((_, row) => {
      const $row = $(row);
      const $dateCell = $row.find('td[title="Fecha del Sorteo"]');
      const $numbersCell = $row.find('td[title="Números Ganadores"] span');
      
      if ($dateCell.length && $numbersCell.length) {
        const dateText = $dateCell.text().trim();
        const titleAttr = $numbersCell.attr('title') || '';
        
        if (dateText && titleAttr) {
          const parsedDate = parseDate(dateText);
          const numbers = parseNumbersFromTitle(titleAttr);
          
          if (parsedDate && numbers.length >= 6) {
            let bonus: number | undefined;
            let bonus2: number | undefined;
            
            const titleParts = titleAttr.split('+');
            if (titleParts.length >= 2) {
              const bonusStr = titleParts[1].trim();
              if (gameType === 'MAS') {
                bonus = parseInt(bonusStr, 10);
              } else if (gameType === 'SUPERMAS') {
                const bonusParts = bonusStr.split('-');
                bonus = parseInt(bonusParts[0], 10);
                if (bonusParts.length >= 2) {
                  bonus2 = parseInt(bonusParts[1], 10);
                }
              }
            }

            results.push({
              date: parsedDate,
              numbers: numbers.slice(0, 6),
              bonus,
              bonus2,
              gameType,
            });
          }
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
