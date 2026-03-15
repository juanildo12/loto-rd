import Link from 'next/link';
import { BarChart3, List, Shuffle, TrendingUp } from 'lucide-react';

const features = [
  {
    title: 'Resultados',
    description: 'Consulta el histórico de sorteos del Loto, MAS y Supermas',
    icon: List,
    href: '/resultados',
    color: 'bg-blue-500',
  },
  {
    title: 'Estadísticas',
    description: 'Análisis completo: números frecuentes, patrones y más',
    icon: BarChart3,
    href: '/estadisticas',
    color: 'bg-purple-500',
  },
  {
    title: 'Generador',
    description: 'Genera combinaciones basadas en estadísticas',
    icon: Shuffle,
    href: '/generador',
    color: 'bg-green-500',
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
          LOTO RD
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Análisis estadístico de los sorteos de LEIDSA República Dominicana
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100"
            >
              <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <TrendingUp className="w-10 h-10 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Próximo Sorteo</h2>
            <p className="text-purple-100">
              Los sorteos del Loto se realizan los <strong>miércoles y sábados</strong> a las <strong>8:55 PM</strong>.
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="block text-purple-200">Loto</span>
                <span className="font-bold">RD$20+ millones</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="block text-purple-200">MAS</span>
                <span className="font-bold">RD$150+ millones</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="block text-purple-200">Supermas</span>
                <span className="font-bold">RD$250+ millones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800 text-center">
          <strong>Nota:</strong> Esta aplicación es solo para fines informativos y de entretenimiento. 
          Las loterías son juegos de azar y no existe garantía de ganar.
        </p>
      </div>
    </div>
  );
}
