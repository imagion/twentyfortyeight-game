'use client';

import { useEffect, useState } from 'react';

type Cell = {
  row: number;
  col: number;
};

export default function GameBoard() {
  const rows = 4;
  const cols = 4;

  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // ХЕЛПЕР-ФУНКЦИИ

  // Создает пустую доску
  const createEmptyBoard = () => {
    const board: number[][] = [];
    for (let i = 0; i < rows; i++) {
      board.push(Array(cols).fill(0));
    }
    return board;
  };

  // Добавляет одну фишку в случайную пустую ячейку
  const addRandomTile = (boardToAddOn: number[][]): number[][] => {
    const emptyCells: Cell[] = [];
    boardToAddOn.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue === 0) {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    if (emptyCells.length === 0) return boardToAddOn;

    const randomCell =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;

    // Создаем копию, чтобы не мутировать `boardToAddOn` напрямую
    const newBoard = boardToAddOn.map((row) => [...row]);
    newBoard[randomCell.row][randomCell.col] = newValue;
    return newBoard;
  };

  // Проверяет, окончена ли игра
  const checkGameOver = (boardToCheck: number[][]): boolean => {
    // Есть ли пустые ячейки?
    if (boardToCheck.some((row) => row.some((cell) => cell === 0))) {
      return false;
    }

    // Возможные слияния?
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Проверка с правым соседом
        if (c < cols - 1 && boardToCheck[r][c] === boardToCheck[r][c + 1]) {
          return false;
        }
        // Проверка с нижним соседом
        if (r < rows - 1 && boardToCheck[r][c] === boardToCheck[r + 1][c]) {
          return false;
        }
      }
    }

    return true;
  };

  // Обрабатывает одну линию (сдвиг и слияние влево)
  const processLine = (line: number[]): { line: number[]; points: number } => {
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
    const finalZeroes = Array(shiftedLine.length - finalNumbers.length).fill(0);
    const finalLine = finalNumbers.concat(finalZeroes);

    return { line: finalLine, points: gainedPoints };
  };

  // Транспонирует доску (меняет строки и столбцы местами)
  const transpose = (boardToTranspose: number[][]): number[][] => {
    const transposed = createEmptyBoard();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        transposed[c][r] = boardToTranspose[r][c];
      }
    }
    return transposed;
  };

  // Инициализация или перезапуск игры
  const initializeGame = () => {
    let startingBoard = createEmptyBoard();
    startingBoard = addRandomTile(startingBoard);
    startingBoard = addRandomTile(startingBoard);
    setBoard(startingBoard);
    setScore(0);
    setIsGameOver(false);
  };

  // Универсальная функция, которая выполняет ход и обновляет состояние
  const operate = (newBoard: number[][], totalPoints: number) => {
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
  };

  // Движение
  const moveLeft = () => {
    let totalPoints = 0;
    const newBoard = board.map((row) => {
      const result = processLine(row);
      totalPoints += result.points;
      return result.line;
    });
    operate(newBoard, totalPoints);
  };

  const moveRight = () => {
    let totalPoints = 0;
    const newBoard = board.map((row) => {
      const result = processLine([...row].reverse());
      totalPoints += result.points;
      return result.line.reverse();
    });
    operate(newBoard, totalPoints);
  };

  const moveUp = () => {
    let totalPoints = 0;
    const transposed = transpose(board);
    const newTransposedBoard = transposed.map((row) => {
      const result = processLine(row);
      totalPoints += result.points;
      return result.line;
    });
    const newBoard = transpose(newTransposedBoard);
    operate(newBoard, totalPoints);
  };

  const moveDown = () => {
    let totalPoints = 0;
    const transposed = transpose(board);
    const newTransposedBoard = transposed.map((row) => {
      const result = processLine([...row].reverse());
      totalPoints += result.points;
      return result.line.reverse();
    });
    const newBoard = transpose(newTransposedBoard);
    operate(newBoard, totalPoints);
  };

  // Обработчик нажатий клавиш
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowUp':
          moveUp();
          break;
        case 'ArrowDown':
          moveDown();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [board]);

  useEffect(() => {
    initializeGame();
  }, []);

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
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: '90vw',
            height: '90vw',
            maxWidth: '448px',
            maxHeight: '448px',
          }}>
          {board.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
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
