'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

type Tile = {
  id: number;
  value: number;
};

const ROWS = 4;
const COLS = 4;
const HIGH_SCORE_KEY = '2048-high-score'; // Ключ для localStorage

// Карта цветов для плиток. Легко расширять.
const TILE_COLORS: { [key: number]: string } = {
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
const EMPTY_TILE_COLOR = 'bg-gray-200 dark:bg-gray-900';

export default function GameBoard() {
  const [board, setBoard] = useState<Tile[][]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [tileIdCounter, setTileIdCounter] = useState(1);

  // Создает пустую доску
  const createEmptyBoard = useCallback((): Tile[][] => {
    return Array.from({ length: ROWS }, () =>
      Array(COLS).fill({ id: 0, value: 0 }),
    );
  }, []);

  // Добавляет одну фишку в случайную пустую ячейку
  const addRandomTile = useCallback(
    (boardToAddOn: Tile[][]): Tile[][] => {
      const emptyCells: { row: number; col: number }[] = [];
      boardToAddOn.forEach((row, r) =>
        row.forEach((tile, c) => {
          if (tile.value === 0) emptyCells.push({ row: r, col: c });
        }),
      );

      if (emptyCells.length === 0) return boardToAddOn;

      const randomCell =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newValue = Math.random() < 0.9 ? 2 : 4;
      const newBoard = boardToAddOn.map((row) => [...row]);

      setTileIdCounter((prev) => prev + 1);
      newBoard[randomCell.row][randomCell.col] = {
        id: tileIdCounter,
        value: newValue,
      };
      return newBoard;
    },
    [tileIdCounter],
  );

  // Инициализация или перезапуск игры
  const initializeGame = useCallback(() => {
    let startingBoard = createEmptyBoard();
    startingBoard = addRandomTile(startingBoard);
    startingBoard = addRandomTile(startingBoard);
    setBoard(startingBoard);
    setScore(0);
    setIsGameOver(false);
  }, [createEmptyBoard, addRandomTile]);

  // Проверяет, окончена ли игра
  const checkGameOver = useCallback((boardToCheck: Tile[][]): boolean => {
    // Есть ли пустые ячейки?
    if (boardToCheck.some((row) => row.some((tile) => tile.value === 0)))
      return false;

    // Возможные слияния?
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Проверка с правым соседом
        if (
          c < COLS - 1 &&
          boardToCheck[r][c].value === boardToCheck[r][c + 1].value
        )
          return false;

        // Проверка с нижним соседом
        if (
          r < ROWS - 1 &&
          boardToCheck[r][c].value === boardToCheck[r + 1][c].value
        )
          return false;
      }
    }

    return true;
  }, []);

  // Обрабатывает одну линию (сдвиг и слияние влево)
  const processLine = useCallback(
    (line: Tile[]): { line: Tile[]; points: number } => {
      // Сдвиг влево
      const numbersOnly = line.filter((tile) => tile.value !== 0);
      const zeroes = Array(line.length - numbersOnly.length).fill({
        id: 0,
        value: 0,
      });
      const shiftedLine = numbersOnly.concat(zeroes);

      let gainedPoints = 0;

      // Слияние
      for (let i = 0; i < shiftedLine.length - 1; i++) {
        if (
          shiftedLine[i].value !== 0 &&
          shiftedLine[i].value === shiftedLine[i + 1].value
        ) {
          const mergedValue = shiftedLine[i].value * 2;
          shiftedLine[i] = { id: shiftedLine[i + 1].id, value: mergedValue };
          gainedPoints += mergedValue;
          shiftedLine[i + 1] = { id: 0, value: 0 };
        }
      }

      // Финальный сдвиг влево
      const finalNumbers = shiftedLine.filter((tile) => tile.value !== 0);
      const finalZeroes = Array(shiftedLine.length - finalNumbers.length).fill({
        id: 0,
        value: 0,
      });
      const finalLine = finalNumbers.concat(finalZeroes);

      return { line: finalLine, points: gainedPoints };
    },
    [],
  );

  // Транспонирует доску (меняет строки и столбцы местами)
  const transpose = useCallback(
    (boardToTranspose: Tile[][]): Tile[][] => {
      const transposed = createEmptyBoard();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          transposed[c][r] = boardToTranspose[r][c];
        }
      }
      return transposed;
    },
    [createEmptyBoard],
  );

  // Универсальная функция, которая выполняет ход и обновляет состояние
  const operate = useCallback(
    (newBoard: Tile[][], totalPoints: number) => {
      if (JSON.stringify(board) !== JSON.stringify(newBoard)) {
        const finalBoard = addRandomTile(newBoard);
        setBoard(finalBoard);
        if (totalPoints > 0) setScore((prev) => prev + totalPoints);
        if (checkGameOver(finalBoard)) setIsGameOver(true);
      } else {
        if (checkGameOver(newBoard)) setIsGameOver(true);
      }
    },
    [board, addRandomTile, checkGameOver],
  );

  // Движение
  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (isGameOver) return;
      let totalPoints = 0;
      let boardToProcess = board.map((row) => [...row]);

      if (direction === 'up' || direction === 'down') {
        boardToProcess = transpose(boardToProcess);
      }

      const newProcessedBoard = boardToProcess.map((row) => {
        const rowToProcess =
          direction === 'right' || direction === 'down'
            ? [...row].reverse()
            : row;
        const result = processLine(rowToProcess);
        totalPoints += result.points;
        return direction === 'right' || direction === 'down'
          ? result.line.reverse()
          : result.line;
      });

      const newBoard =
        direction === 'up' || direction === 'down'
          ? transpose(newProcessedBoard)
          : newProcessedBoard;
      operate(newBoard, totalPoints);
    },
    [board, isGameOver, operate, processLine, transpose],
  );

  // Обработчик нажатий клавиш
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

  // Работа с localStorage
  useEffect(() => {
    // Читаем рекорд при монтировании компонента
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Сохранение рекорда при изменении счета
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [score, highScore]);

  // Инициализация
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
      </div>

      <div className='relative rounded-lg bg-slate-800 p-2 shadow-2xl'>
        {isGameOver && (
          <div className='absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg bg-black/70'>
            <p className='text-5xl font-bold text-white'>Игра окончена</p>
          </div>
        )}

        <div className='grid grid-cols-4 grid-rows-4 gap-2'>
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-md ${EMPTY_TILE_COLOR}`}
            />
          ))}
        </div>

        <div className='absolute inset-2 grid grid-cols-4 grid-rows-4 gap-2'>
          <AnimatePresence>
            {board.map((row, r) =>
              row.map((tile, c) =>
                tile.value !== 0 ? (
                  <motion.div
                    key={tile.id}
                    layoutId={tile.id.toString()}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute flex items-center justify-center rounded-md text-3xl font-bold transition-colors select-none sm:text-5xl ${
                      TILE_COLORS[tile.value] || 'bg-gray-500'
                    }`}
                    style={{
                      gridRowStart: r + 1,
                      gridColumnStart: c + 1,
                      width: '100%',
                      height: '100%',
                    }}>
                    {tile.value}
                  </motion.div>
                ) : null,
              ),
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
