'use client';

type GameHeaderProps = {
  score: number;
  highScore: number;
  onNewGame: () => void;
};

export default function GameHeader({
  score,
  highScore,
  onNewGame,
}: GameHeaderProps) {
  return (
    <div className='grid w-full grid-cols-3 gap-2'>
      <div className='col-span-1 rounded-md bg-neutral-700 p-3 text-center'>
        <p className='text-sm font-medium text-blue-200'>СЧЕТ</p>
        <span className='text-2xl font-bold text-white'>{score}</span>
      </div>
      <div className='col-span-1 rounded-md bg-neutral-700 p-3 text-center'>
        <p className='text-sm font-medium text-blue-200'>ЛУЧШИЙ</p>
        <span className='text-2xl font-bold text-white'>{highScore}</span>
      </div>
      <button
        onClick={onNewGame}
        className='focus:ring-opacity-75 col-span-1 rounded-md bg-sky-500 font-bold text-white shadow-md transition-colors hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:outline-none'>
        Новая игра
      </button>
      {/* TODO: Вернуть переключатель тем, когда логика будет полностью стабильна. */}
    </div>
  );
}
