import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { scrapeAllResults } from '@/lib/scraper';

export async function POST(request: Request) {
  try {
    const { year, month } = await request.json();

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    console.log(`Scraping results for ${year}-${month}...`);
    const results = await scrapeAllResults(year, month);
    
    console.log(`Found ${results.length} results`);

    let imported = 0;
    let skipped = 0;

    for (const result of results) {
      try {
        await prisma.draw.upsert({
          where: {
            date_gameType: {
              date: new Date(result.date),
              gameType: result.gameType,
            },
          },
          update: {
            numbers: JSON.stringify(result.numbers),
            bonus: result.bonus,
            bonus2: result.bonus2,
          },
          create: {
            date: new Date(result.date),
            gameType: result.gameType,
            numbers: JSON.stringify(result.numbers),
            bonus: result.bonus,
            bonus2: result.bonus2,
          },
        });
        imported++;
      } catch (err) {
        console.error('Error importing:', err);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: results.length,
      sample: results.slice(0, 2),
    });
  } catch (error) {
    console.error('Error scraping:', error);
    return NextResponse.json(
      { error: 'Failed to scrape results', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to scrape results',
    body: { year: 2024, month: 1 },
  });
}
