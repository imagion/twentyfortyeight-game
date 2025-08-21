'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  createEmptyBoard,
  placeRandomTile,
  checkGameOver,
  slideAndMergeLine,
  transpose,
  boardsEqual,
} from '@/utils/gameLogic';
import { cn } from '@/app/utils/cn';
import { Board } from '@/types/globals';

const HIGH_SCORE_KEY = '2048-high-score';

const TILE_COLORS: Record<number, string | undefined> = {
  2: 'bg-gray-100 text-gray-800',
  4: 'bg-amber-100 text-amber-900',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-red-400 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-white',
  256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white',
  1024: 'bg-purple-500 text-white',
  2048: 'bg-purple-700 text-white',
};
const DEFAULT_TILE_COLOR = 'bg-gray-200 dark:bg-gray-900';

export default function GameBoard() {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const initializeGame = useCallback(() => {
    let startingBoard = createEmptyBoard();
    startingBoard = placeRandomTile(startingBoard);
    startingBoard = placeRandomTile(startingBoard);
    setBoard(startingBoard);
    setScore(0);
    setIsGameOver(false);
  }, []);

  const finalizeMove = useCallback(
    (newBoard: number[][], totalPoints: number) => {
      if (!boardsEqual(board, newBoard)) {
        const boardWithNewTile = placeRandomTile(newBoard);
        setBoard(boardWithNewTile);
        if (totalPoints > 0) setScore((prev) => prev + totalPoints);

        // TODO: Добавить проверку на победу (достижение плитки 2048) и показать сообщение.
        if (checkGameOver(boardWithNewTile)) setIsGameOver(true);
      } else if (checkGameOver(newBoard)) {
        setIsGameOver(true);
      }
    },
    [board],
  );

  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (isGameOver) return;

      let totalPoints = 0;
      let boardToProcess = board.map((row) => [...row]);

      if (direction === 'up' || direction === 'down') {
        boardToProcess = transpose(boardToProcess);
      }

      const newProcessedBoard = boardToProcess.map((row) => {
        const isReversed = direction === 'right' || direction === 'down';
        const rowToProcess = isReversed ? [...row].reverse() : row;

        const result = slideAndMergeLine(rowToProcess);
        totalPoints += result.points;

        return isReversed ? result.line.reverse() : result.line;
      });

      const newBoard =
        direction === 'up' || direction === 'down'
          ? transpose(newProcessedBoard)
          : newProcessedBoard;

      finalizeMove(newBoard, totalPoints);
    },
    [board, isGameOver, finalizeMove],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // TODO: Добавить поддержку свайпов на мобильных устройствах.
      switch (e.code) {
        case 'ArrowLeft':
          move('left');
          break;
        case 'ArrowRight':
          move('right');
          break;
        case 'ArrowUp':
          move('up');
          break;
        case 'ArrowDown':
          move('down');
          break;
      }
    };
    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className='flex w-full max-w-md flex-col items-center gap-4'>
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
          onClick={initializeGame}
          className='focus:ring-opacity-75 col-span-1 rounded-md bg-sky-500 font-bold text-white shadow-md transition-colors hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:outline-none'>
          Новая игра
        </button>
        {/* TODO: Вернуть переключатель тем, когда логика будет полностью стабильна. */}
      </div>

      <div className='relative rounded-lg bg-slate-400 p-2 shadow-2xl dark:bg-slate-700'>
        {isGameOver && (
          <div className='absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-black/50'>
            <p className='text-5xl font-bold text-white'>Игра окончена</p>
          </div>
        )}
        <div
          className='grid grid-cols-4 grid-rows-4 gap-1'
          style={{
            width: 'clamp(280px, 90vw, 448px)',
            height: 'clamp(280px, 90vw, 448px)',
          }}>
          {board.map((row, r) =>
            row.map((value, c) => (
              <div
                key={`${r}-${c}`}
                className={cn(
                  'flex items-center justify-center rounded-md text-3xl font-bold transition-colors select-none sm:text-5xl',
                  TILE_COLORS[value] || DEFAULT_TILE_COLOR,
                )}>
                {/* // TODO: Анимация появления/слияния плиток. Потребует изменения структуры `board` на `Tile[][]`. */}
                {value !== 0 && value}
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
