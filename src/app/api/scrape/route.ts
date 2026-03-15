import { NextResponse } from 'next/server';
import { scrapeAllResults } from '@/lib/scraper';

export async function POST() {
  try {
    console.log(`Scraping results from enloteria.com...`);
    const results = await scrapeAllResults();
    
    console.log(`Found ${results.length} results`);

    return NextResponse.json({
      success: true,
      total: results.length,
      sample: results.slice(0, 3),
      message: 'Scraper updated but not connected to database yet',
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
    message: 'Use POST to scrape results from enloteria.com',
  });
}
