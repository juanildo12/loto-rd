'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { LotoBall } from '@/components/LotoBall';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Statistics {
  totalDraws: number;
  mostFrequent: { number: number; frequency: number; lastDraw: string | null; daysSinceLastDraw: number | null }[];
  leastFrequent: { number: number; frequency: number; lastDraw: string | null; daysSinceLastDraw: number | null }[];
  averageSum: number;
  oddEvenRatio: { odd: number; even: number };
  numberRangeDistribution: { range: string; count: number }[];
}

interface FrequencyData {
  number: number;
  frequency: number;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

export default function EstadisticasPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [frequencies, setFrequencies] = useState<FrequencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameType, setGameType] = useState<string>('MAS');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats?gameType=${gameType}&limit=200`);
        const data = await res.json();
        setStats(data.statistics);
        setFrequencies(data.frequencies.slice(0, 20));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [gameType]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const pieData = stats
    ? [
        { name: 'Impares', value: stats.oddEvenRatio.odd },
        { name: 'Pares', value: stats.oddEvenRatio.even },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Estadísticas</h1>
          <p className="text-gray-600">Análisis de los sorteos</p>
        </div>
        
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="MAS">LOTO MAS</option>
          <option value="SUPERMAS">Supermas</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sorteos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalDraws || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calculator className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Suma Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.averageSum || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pares</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.oddEvenRatio.even || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-3 rounded-lg">
              <TrendingDown className="text-pink-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Impares</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.oddEvenRatio.odd || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Números Más Frecuentes</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {stats?.mostFrequent.slice(0, 6).map((item) => (
              <div key={item.number} className="flex items-center gap-2">
                <LotoBall number={item.number} />
                <span className="text-sm text-gray-500">({item.frequency})</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.mostFrequent.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="number" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="frequency" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Números Menos Frecuentes</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {stats?.leastFrequent.slice(0, 6).map((item) => (
              <div key={item.number} className="flex items-center gap-2">
                <LotoBall number={item.number} />
                <span className="text-sm text-gray-500">({item.frequency})</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.leastFrequent.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="number" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="frequency" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribución Pares/Impares</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribución por Rangos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.numberRangeDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frecuencia de Números (Top 20)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={frequencies} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="number" width={40} />
            <Tooltip />
            <Bar dataKey="frequency" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
