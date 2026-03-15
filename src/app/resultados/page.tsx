'use client';

import { useState, useEffect } from 'react';
import { DrawCard } from '@/components/LotoBall';
import { RefreshCw, Filter } from 'lucide-react';

interface Draw {
  id: number;
  date: string;
  gameType: string;
  numbers: number[];
  bonus?: number;
  bonus2?: number;
}

export default function ResultadosPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameType, setGameType] = useState<string>('MAS');
  const [scraping, setScraping] = useState(false);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const url = gameType === 'all' 
        ? '/api/draws?limit=50'
        : `/api/draws?gameType=${gameType}&limit=50`;
      const res = await fetch(url);
      const data = await res.json();
      setDraws(data);
    } catch (error) {
      console.error('Error fetching draws:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2024, month: 1 }),
      });
      const data = await res.json();
      console.log('Scraping result:', data);
      fetchDraws();
    } catch (error) {
      console.error('Error scraping:', error);
    } finally {
      setScraping(false);
    }
  };

  useEffect(() => {
    fetchDraws();
  }, [gameType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Resultados</h1>
          <p className="text-gray-600">Historial de sorteos del Loto</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            <Filter size={18} className="text-gray-500" />
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="border-none bg-transparent text-sm focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="MAS">LOTO MAS</option>
              <option value="SUPERMAS">Supermas</option>
            </select>
          </div>
          
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={scraping ? 'animate-spin' : ''} />
            {scraping ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : draws.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 mb-4">No hay resultados disponibles</p>
          <p className="text-sm text-gray-400">Usa el botón "Actualizar" para obtener datos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {draws.map((draw) => (
            <DrawCard
              key={draw.id}
              date={draw.date}
              gameType={draw.gameType}
              numbers={draw.numbers}
              bonus={draw.bonus}
              bonus2={draw.bonus2}
            />
          ))}
        </div>
      )}
    </div>
  );
}
