'use client';

import { useState } from 'react';
import { Shuffle, Copy, RefreshCw, Sparkles, Settings2, Zap, Target, BarChart3 } from 'lucide-react';
import { LotoBall } from '@/components/LotoBall';

interface Combination {
  numbers: number[];
  bonus?: number;
  bonus2?: number;
  score?: number;
  details?: {
    avgSum: number;
    oddCount: number;
    evenCount: number;
    rangeDistribution: number[];
  };
}

interface Weights {
  frequency: number;
  hotCold: number;
  parity: number;
  sum: number;
  range: number;
  recency: number;
  pairs: number;
}

const presets = [
  { 
    id: 'conservador', 
    label: 'Conservador', 
    desc: 'Mayor peso a números frecuentes',
    icon: Shield,
    weights: { frequency: 40, hotCold: 20, parity: 15, sum: 15, range: 5, recency: 5, pairs: 0 }
  },
  { 
    id: 'balanceado', 
    label: 'Balanceado', 
    desc: 'Mezcla de todas las estrategias',
    icon: Scale,
    weights: { frequency: 25, hotCold: 25, parity: 15, sum: 15, range: 10, recency: 5, pairs: 5 }
  },
  { 
    id: 'agresivo', 
    label: 'Agresivo', 
    desc: 'Mayor peso a números calientes',
    icon: Zap,
    weights: { frequency: 15, hotCold: 35, parity: 10, sum: 10, range: 10, recency: 15, pairs: 5 }
  },
  { 
    id: 'frio', 
    label: 'Números Fríos', 
    desc: 'Números que no han salido recientemente',
    icon: Snowflake,
    weights: { frequency: 10, hotCold: 40, parity: 10, sum: 10, range: 10, recency: 20, pairs: 0 }
  },
];

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function Scale({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 3l5 5-5 5M8 3L3 8l5 5M21 14H3M12 3v18" />
    </svg>
  );
}

function Snowflake({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  );
}

export default function GeneradorPage() {
  const [gameType, setGameType] = useState<'MAS' | 'SUPERMAS'>('MAS');
  const [count, setCount] = useState(1);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [weights, setWeights] = useState<Weights>({
    frequency: 25,
    hotCold: 25,
    parity: 15,
    sum: 15,
    range: 10,
    recency: 10,
    pairs: 5,
  });

  const generate = async () => {
    setLoading(true);
    try {
      const body: any = { 
        gameType, 
        count,
        weights,
      };
      
      if (selectedPreset) {
        body.preset = selectedPreset;
      }
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.combinations) {
        setCombinations(data.combinations);
      }
    } catch (error) {
      console.error('Error generating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setWeights(preset.weights);
    }
  };

  const copyToClipboard = (numbers: number[], bonus?: number, bonus2?: number) => {
    let text = numbers.join(', ');
    if (bonus) text += ` + ${bonus}`;
    if (bonus2) text += `, ${bonus2}`;
    navigator.clipboard.writeText(text);
  };

  const weightLabels: Record<keyof Weights, string> = {
    frequency: 'Frecuencia',
    hotCold: 'Caliente/Frío',
    parity: 'Paridad',
    sum: 'Suma',
    range: 'Rangos',
    recency: 'Recientes',
    pairs: 'Pares',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-900">Generador Avanzado</h1>
        <p className="text-gray-600">Genera combinaciones usando análisis estadístico avanzado</p>
      </div>

      {/* Presets */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target size={20} className="text-purple-600" />
          Presets
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPreset === preset.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={18} className="text-purple-600" />
                  <span className="font-medium text-gray-800">{preset.label}</span>
                </div>
                <p className="text-xs text-gray-500">{preset.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-gray-700 font-semibold mb-4 hover:text-purple-600"
        >
          <Settings2 size={20} />
          Configuración Avanzada
          <span className="text-xs text-gray-500 ml-2">
            ({showAdvanced ? 'visible' : 'oculto'})
          </span>
        </button>
        
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Peso: Frecuencia ({weights.frequency}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.frequency}
                onChange={(e) => {
                  setSelectedPreset(null);
                  setWeights({ ...weights, frequency: parseInt(e.target.value) });
                }}
                className="w-full"
              />
              
              <label className="block text-sm font-medium text-gray-700">
                Peso: Caliente/Frío ({weights.hotCold}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.hotCold}
                onChange={(e) => {
                  setSelectedPreset(null);
                  setWeights({ ...weights, hotCold: parseInt(e.target.value) });
                }}
                className="w-full"
              />
              
              <label className="block text-sm font-medium text-gray-700">
                Peso: Paridad ({weights.parity}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.parity}
                onChange={(e) => {
                  setSelectedPreset(null);
                  setWeights({ ...weights, parity: parseInt(e.target.value) });
                }}
                className="w-full"
              />
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Peso: Suma ({weights.sum}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.sum}
                onChange={(e) => {
                  setSelectedPreset(null);
                  setWeights({ ...weights, sum: parseInt(e.target.value) });
                }}
                className="w-full"
              />
              
              <label className="block text-sm font-medium text-gray-700">
                Peso: Rangos ({weights.range}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.range}
                onChange={(e) => {
                  setSelectedPreset(null);
                  setWeights({ ...weights, range: parseInt(e.target.value) });
                }}
                className="w-full"
              />
              
              <label className="block text-sm font-medium text-gray-700">
                Peso: Números Recientes ({weights.recency}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={weights.recency}
                onChange={(e) => {
                  setSelectedPreset(null);
                  setWeights({ ...weights, recency: parseInt(e.target.value) });
                }}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Game Settings */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Juego</label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value as 'MAS' | 'SUPERMAS')}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="MAS">LOTO MAS</option>
              <option value="SUPERMAS">Supermas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} />
              )}
              {loading ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {combinations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            Tus Combinaciones
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinations.map((combo, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-100 hover:border-purple-300 transition-colors"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-purple-700">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {combo.score && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Score: {combo.score}
                      </span>
                    )}
                    <button
                      onClick={() => copyToClipboard(combo.numbers, combo.bonus, combo.bonus2)}
                      className="text-gray-400 hover:text-purple-600"
                      title="Copiar"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center gap-2 flex-wrap mb-3">
                  {combo.numbers.map((num) => (
                    <LotoBall key={num} number={num} />
                  ))}
                </div>
                
                {(combo.bonus || combo.bonus2) && (
                  <div className="flex justify-center gap-2 mt-3">
                    {combo.bonus && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Bono:</span>
                        <LotoBall number={combo.bonus} bonus />
                      </div>
                    )}
                    {combo.bonus2 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Bono2:</span>
                        <LotoBall number={combo.bonus2} bonus2 />
                      </div>
                    )}
                  </div>
                )}
                
                {combo.details && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 grid grid-cols-2 gap-1">
                    <div>Suma: <span className="font-medium">{combo.details.avgSum}</span></div>
                    <div>Impares: <span className="font-medium">{combo.details.oddCount}</span></div>
                    <div>Pares: <span className="font-medium">{combo.details.evenCount}</span></div>
                    <div>Rangos: {combo.details.rangeDistribution.join('-')}</div>
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
