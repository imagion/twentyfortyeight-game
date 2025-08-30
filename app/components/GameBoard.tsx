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
import { Board, Direction } from '@/types/globals';
import { motion, AnimatePresence } from 'motion/react';
import GameHeader from '@/components/GameHeader';

const HIGH_SCORE_KEY = '2048-high-score';

// prettier-ignore
const TILE_COLORS: Record<number, string | undefined> = {
  2: 'bg-gray-100 text-gray-800',  4: 'bg-amber-100 text-amber-900',
  8: 'bg-orange-300 text-white',   16: 'bg-orange-400 text-white',
  32: 'bg-red-400 text-white',     64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-white', 256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white', 1024: 'bg-purple-500 text-white',
  2048: 'bg-purple-700 text-white', 
};
const DEFAULT_TILE_COLOR = 'bg-gray-200 dark:bg-gray-900';

export default function GameBoard() {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [tileIdCounter, setTileIdCounter] = useState<number>(1);
  const [touchStartPos, setTouchStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const initializeGame = useCallback(() => {
    let currentId = 1;
    let startingBoard = createEmptyBoard();
    startingBoard = placeRandomTile(startingBoard, currentId++);
    startingBoard = placeRandomTile(startingBoard, currentId++);
    setTileIdCounter(currentId);
    setBoard(startingBoard);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    setShowVictoryModal(false);
  }, []);

  const finalizeMove = useCallback(
    (newBoard: Board, totalPoints: number) => {
      if (!boardsEqual(board, newBoard)) {
        const boardWithNewTile = placeRandomTile(newBoard, tileIdCounter);
        setTileIdCounter((prev) => prev + 1);
        setBoard(boardWithNewTile);

        if (
          !hasWon &&
          boardWithNewTile.flat().some((tile) => tile.value === 2048)
        ) {
          setHasWon(true);
          setShowVictoryModal(true);
        }

        if (totalPoints > 0) {
          setScore((prev) => {
            const next = prev + totalPoints;
            if (next > highScore) {
              setHighScore(next);
              localStorage.setItem(HIGH_SCORE_KEY, String(next));
            }
            return next;
          });
        }

        if (checkGameOver(boardWithNewTile)) setIsGameOver(true);
      }
    },
    [board, hasWon, highScore, tileIdCounter],
  );

  const move = useCallback(
    (direction: Direction) => {
      if (isGameOver) return;

      let totalPoints = 0;
      let boardToProcess = board.map((row) => [...row]);

      const isVertical = direction === 'up' || direction === 'down';
      if (isVertical) boardToProcess = transpose(boardToProcess);

      const newProcessedBoard = boardToProcess.map((row) => {
        const isReversed = direction === 'right' || direction === 'down';
        const rowToProcess = isReversed ? [...row].reverse() : row;
        const result = slideAndMergeLine(rowToProcess);
        totalPoints += result.points;
        return isReversed ? result.line.reverse() : result.line;
      });

      const newBoard = isVertical
        ? transpose(newProcessedBoard)
        : newProcessedBoard;
      finalizeMove(newBoard, totalPoints);
    },
    [board, isGameOver, finalizeMove],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    const firstTouch = e.touches[0];
    setTouchStartPos({ x: firstTouch.clientX, y: firstTouch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos) return;
    // Предотвращаем скролл страницы во время свайпа по доске.
    e.preventDefault();
  };

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartPos) return;

      const endTouch = e.changedTouches[0];
      const deltaX = endTouch.clientX - touchStartPos.x;
      const deltaY = endTouch.clientY - touchStartPos.y;

      // Устанавливаем минимальную дистанцию свайпа, чтобы отсечь случайные касания
      const minSwipeDistance = 50;

      if (
        Math.abs(deltaX) < minSwipeDistance &&
        Math.abs(deltaY) < minSwipeDistance
      ) {
        setTouchStartPos(null);
        return;
      }

      // Определяем, был ли свайп больше горизонтальным или вертикальным
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          move('right');
        } else {
          move('left');
        }
      } else {
        if (deltaY > 0) {
          move('down');
        } else {
          move('up');
        }
      }

      setTouchStartPos(null);
    },
    [move, touchStartPos],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Расплющиваем доску в одномерный массив для удобства рендеринга с AnimatePresence.
  const flatTiles = board.flat().filter((tile) => tile.value !== 0);

  return (
    <div className='flex w-full max-w-md flex-col items-center gap-4'>
      <GameHeader
        score={score}
        highScore={highScore}
        onNewGame={initializeGame}
      />

      {/* Контейнер для доски*/}
      <div
        className='relative rounded-lg bg-slate-400 p-2 shadow-2xl dark:bg-slate-700'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: 'clamp(280px, 90vw, 448px)',
          height: 'clamp(280px, 90vw, 448px)',
        }}>
        {/* Конец игры */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg bg-black/70'>
              <p className='text-5xl font-bold text-white'>Игра окончена</p>
            </motion.div>
          )}
          {showVictoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-lg bg-black/70'>
              <p className='text-5xl font-bold text-yellow-400'>Победа!</p>
              <button
                onClick={() => setShowVictoryModal(false)}
                className='rounded-md bg-sky-500 px-6 py-2 font-bold text-white transition-colors hover:bg-sky-600'>
                Продолжить
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Фоновый слой */}
        <div className='grid h-full w-full grid-cols-4 grid-rows-4 gap-2'>
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={index} className='rounded-md bg-gray-200/50' />
          ))}
        </div>
        {/* Анимационный слой */}
        <div className='absolute inset-2 grid grid-cols-4 grid-rows-4 gap-2'>
          <AnimatePresence>
            {flatTiles.map((tile) => {
              let r = -1,
                c = -1;
              for (let i = 0; i < 4; i++) {
                // Добавляем проверку board[i], чтобы избежать ошибок при первом рендере, когда board пуст.
                const colIndex = board[i]?.findIndex((t) => t.id === tile.id);
                if (colIndex !== -1) {
                  r = i;
                  c = colIndex;
                  break;
                }
              }
              // Анимированный тайл
              return (
                <motion.div
                  key={tile.id}
                  layoutId={tile.id.toString()}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    'flex items-center justify-center rounded-md text-3xl font-bold select-none sm:text-5xl',
                    TILE_COLORS[tile.value] || DEFAULT_TILE_COLOR,
                  )}
                  style={{
                    gridRowStart: r + 1,
                    gridColumnStart: c + 1,
                  }}>
                  {tile.value}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
