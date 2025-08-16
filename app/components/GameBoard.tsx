'use client';

import { useCallback, useEffect, useState } from 'react';

type Cell = {
  row: number;
  col: number;
};

const ROWS = 4;
const COLS = 4;

export default function GameBoard() {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Создает пустую доску
  const createEmptyBoard = useCallback((): number[][] => {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }, []);

  // Добавляет одну фишку в случайную пустую ячейку
  const addRandomTile = useCallback((boardToAddOn: number[][]): number[][] => {
    const emptyCells: Cell[] = [];
    boardToAddOn.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) {
          emptyCells.push({ row: r, col: c });
        }
      });
    });

    if (emptyCells.length === 0) return boardToAddOn;

    const randomCell =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;

    const newBoard = boardToAddOn.map((row) => [...row]);
    newBoard[randomCell.row][randomCell.col] = newValue;
    return newBoard;
  }, []);

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
  const checkGameOver = useCallback((boardToCheck: number[][]): boolean => {
    // Есть ли пустые ячейки?
    if (boardToCheck.some((row) => row.some((cell) => cell === 0))) {
      return false;
    }

    // Возможные слияния?
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Проверка с правым соседом
        if (c < COLS - 1 && boardToCheck[r][c] === boardToCheck[r][c + 1]) {
          return false;
        }
        // Проверка с нижним соседом
        if (r < ROWS - 1 && boardToCheck[r][c] === boardToCheck[r + 1][c]) {
          return false;
        }
      }
    }

    return true;
  }, []);

  // Обрабатывает одну линию (сдвиг и слияние влево)
  const processLine = useCallback(
    (line: number[]): { line: number[]; points: number } => {
      // Сдвиг влево
      const numbersOnly = line.filter((value) => value !== 0);
      const zeroes = Array(line.length - numbersOnly.length).fill(0);
      const shiftedLine = numbersOnly.concat(zeroes);

      let gainedPoints = 0;

      // Слияние
      for (let i = 0; i < shiftedLine.length - 1; i++) {
        if (shiftedLine[i] !== 0 && shiftedLine[i] === shiftedLine[i + 1]) {
          const mergedValue = shiftedLine[i] * 2;
          shiftedLine[i] = mergedValue;
          gainedPoints += mergedValue;
          shiftedLine[i + 1] = 0;
        }
      }

      // Финальный сдвиг влево
      const finalNumbers = shiftedLine.filter((value) => value !== 0);
      const finalZeroes = Array(shiftedLine.length - finalNumbers.length).fill(
        0,
      );
      const finalLine = finalNumbers.concat(finalZeroes);

      return { line: finalLine, points: gainedPoints };
    },
    [],
  );

  // Транспонирует доску (меняет строки и столбцы местами)
  const transpose = useCallback(
    (boardToTranspose: number[][]): number[][] => {
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
    (newBoard: number[][], totalPoints: number) => {
      const boardChanged = JSON.stringify(board) !== JSON.stringify(newBoard);

      if (boardChanged) {
        const finalBoard = addRandomTile(newBoard);
        setBoard(finalBoard);
        setScore((prev) => prev + totalPoints);

        if (checkGameOver(finalBoard)) {
          setIsGameOver(true);
          console.log('Игра окончена!');
        }
      } else {
        if (checkGameOver(newBoard)) {
          setIsGameOver(true);
          console.log('Игра окончена!');
        }
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

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='flex flex-col items-center gap-4 rounded-lg bg-slate-400 p-2 shadow-2xl dark:bg-slate-700'>
        <div className='w-full rounded-md bg-gray-100 p-2 text-center dark:bg-gray-900'>
          <p className='text-lg font-medium text-gray-500 dark:text-gray-400'>
            Счет:{' '}
            <span className='font-mono text-xl font-bold text-green-500'>
              {score}
            </span>
          </p>
        </div>
        <button
          onClick={initializeGame}
          className='focus:ring-opacity-75 rounded-md bg-orange-500 px-4 py-3 text-white shadow-md hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:outline-none'>
          Новая игра
        </button>
      </div>

      <div className='relative rounded-lg bg-slate-400 p-2 shadow-2xl dark:bg-slate-700'>
        {isGameOver && (
          <div className='bg-opacity-50 absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-black'>
            <p className='text-5xl font-bold text-white'>Игра окончена</p>
          </div>
        )}
        <div
          className='grid gap-1'
          style={{
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            width: '90vw',
            height: '90vw',
            maxWidth: '448px',
            maxHeight: '448px',
          }}>
          {board.map((row, r) =>
            row.map((value, c) => (
              <div
                key={`${r}-${c}`}
                className='flex items-center justify-center rounded-md bg-gray-100 text-5xl font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300'>
                {value === 0 ? '' : value}
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
