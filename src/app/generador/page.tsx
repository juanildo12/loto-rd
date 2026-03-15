'use client';

import { useState } from 'react';
import { Shuffle, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { LotoBall } from '@/components/LotoBall';

interface Combination {
  numbers: number[];
  bonus?: number;
}

const strategies = [
  { value: 'random', label: 'Aleatorio', description: 'Selección completamente aleatoria' },
  { value: 'hot', label: 'Números Calientes', description: 'Basado en los números más frecuentes' },
  { value: 'cold', label: 'Números Fríos', description: 'Basado en los números menos frecuentes' },
  { value: 'mixed', label: 'Mixto', description: 'Combinación de calientes y fríos' },
];

export default function GeneradorPage() {
  const [strategy, setStrategy] = useState('random');
  const [gameType, setGameType] = useState('MAS');
  const [count, setCount] = useState(1);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, gameType, count }),
      });
      const data = await res.json();
      setCombinations(data.combinations);
    } catch (error) {
      console.error('Error generating:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (numbers: number[], bonus?: number) => {
    const text = bonus 
      ? `${numbers.join(', ')} + ${bonus}`
      : numbers.join(', ');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-900">Generador</h1>
        <p className="text-gray-600">Genera combinaciones basadas en estadísticas</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Juego
            </label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="MAS">LOTO MAS (6 números + Bono)</option>
              <option value="SUPERMAS">Supermas (6 números + 2 Bonos)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estrategia
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {strategies.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {strategies.find((s) => s.value === strategy)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : (
            <Sparkles size={20} />
          )}
          {loading ? 'Generando...' : 'Generar Combinaciones'}
        </button>
      </div>

      {combinations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Tus Combinaciones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinations.map((combo, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-100 hover:border-purple-300 transition-colors"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-purple-700">
                    Combinación #{index + 1}
                  </span>
                  <button
                    onClick={() => copyToClipboard(combo.numbers, combo.bonus)}
                    className="text-gray-400 hover:text-purple-600 transition-colors"
                    title="Copiar"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 flex-wrap">
                  {combo.numbers.map((num) => (
                    <LotoBall key={num} number={num} />
                  ))}
                </div>
                
                {combo.bonus && (
                  <div className="mt-4 flex justify-center items-center gap-2">
                    <span className="text-sm text-gray-500">Bono:</span>
                    <LotoBall number={combo.bonus} bonus />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800 text-sm text-center">
          <strong>Nota:</strong> Este generador es solo para entretenimiento. 
          No garantiza ganancias. Juega responsablemente.
        </p>
      </div>
    </div>
  );
}
