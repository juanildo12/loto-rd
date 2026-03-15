const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nzaqjzbpkktegsqzppcv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YXFqemJwa2t0ZWdzcXpwcGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTMwMjUsImV4cCI6MjA4OTE2OTAyNX0.Z6VSpPgoGWhODavI0f4xV_tfNd7ut_7sPkqhafSVdNM';

export const getDraws = async (gameType?: string, limit = 50) => {
  let url = `${SUPABASE_URL}/rest/v1/Draw?order=date.desc&limit=${limit}`;
  if (gameType) {
    url += `&gameType=eq.${gameType}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  
  return response.json();
};

export const createDraw = async (draw: {
  date: string;
  gameType: string;
  numbers: number[];
  bonus?: number;
  bonus2?: number;
}) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/Draw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify([{
      date: draw.date,
      gameType: draw.gameType,
      numbers: JSON.stringify(draw.numbers),
      bonus: draw.bonus,
      bonus2: draw.bonus2,
    }]),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create: ${response.status}`);
  }
  
  return response.json();
};

export default SUPABASE_URL;
