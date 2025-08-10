import GameBoard from '@/components/GameBoard';

export default function Home() {
  return (
    <div className='flex h-screen flex-col items-center justify-items-center gap-16 bg-neutral-50 p-4 dark:bg-neutral-600'>
      <h1 className='text-2xl'>2048 Game</h1>
      <GameBoard />
    </div>
  );
}
