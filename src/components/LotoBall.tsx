interface LotoBallProps {
  number: number;
  bonus?: boolean;
  bonus2?: boolean;
}

export function LotoBall({ number, bonus, bonus2 }: LotoBallProps) {
  const getBallStyle = () => {
    if (bonus) {
      return 'bg-green-500 text-white';
    }
    if (bonus2) {
      return 'bg-orange-500 text-white';
    }
    if (number <= 20) {
      return 'bg-blue-500 text-white';
    }
    return 'bg-red-500 text-white';
  };

  return (
    <div
      className={`
        ${getBallStyle()}
        w-10 h-10 sm:w-12 sm:h-12 
        rounded-full 
        flex items-center justify-center 
        font-bold text-lg sm:text-xl 
        shadow-md
        ${bonus || bonus2 ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}
      `}
    >
      {String(number).padStart(2, '0')}
    </div>
  );
}

interface DrawCardProps {
  date: string;
  gameType: string;
  numbers: number[];
  bonus?: number;
  bonus2?: number;
}

export function DrawCard({ date, gameType, numbers, bonus, bonus2 }: DrawCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-purple-700">{gameType}</span>
        <span className="text-sm text-gray-500">{formatDate(date)}</span>
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {numbers.map((num) => (
          <LotoBall key={num} number={num} />
        ))}
        {bonus && <LotoBall number={bonus} bonus />}
        {bonus2 && <LotoBall number={bonus2} bonus2 />}
      </div>
    </div>
  );
}
