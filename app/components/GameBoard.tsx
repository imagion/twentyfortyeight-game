'use client';

import { useEffect, useState } from 'react';

const createEmptyBoard = (rows: number, cols: number) => {
  const board: number[][] = [];
  for (let i = 0; i < rows; i++) {
    board.push(Array(cols).fill(0));
  }
  return board;
};

type Cell = {
  row: number;
  col: number;
};

export default function GameBoard() {
  const rows = 4;
  const cols = 4;

  const [board, setBoard] = useState(createEmptyBoard(rows, cols));

  // Добавляет одну фишку в случайную пустую ячейку
  const addRandomTile = (boardToAddOn: number[][]): number[][] => {
    const emptyCells: Cell[] = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue === 0) {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    if (emptyCells.length === 0) return boardToAddOn; // Нет места

    const randomCell =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;
    const newBoard = boardToAddOn.map((row) => [...row]);
    newBoard[randomCell.row][randomCell.col] = newValue;
    return newBoard;
  };

  // Обработка одной линии
  const processLine = (line: number[]): number[] => {
    // Сдвиг влево
    const numbersOnly = line.filter((value) => value !== 0);
    const zeroes = Array(line.length - numbersOnly.length).fill(0);
    const shiftedLine = numbersOnly.concat(zeroes);

    // Слияние
    for (let i = 0; i < shiftedLine.length - 1; i++) {
      if (shiftedLine[i] !== 0 && shiftedLine[i] === shiftedLine[i + 1]) {
        shiftedLine[i] *= 2;
        shiftedLine[i + 1] = 0;
      }
    }

    // Финальный сдвиг влево
    const finalNumbers = shiftedLine.filter((value) => value !== 0);
    const finalZeroes = Array(shiftedLine.length - finalNumbers.length).fill(0);

    return finalNumbers.concat(finalZeroes);
  };

  // Транспонирование
  const transpose = (boardToTranspose: number[][]): number[][] => {
    const transposed = createEmptyBoard(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        transposed[c][r] = boardToTranspose[r][c];
      }
    }
    return transposed;
  };

  // Универсальная функция, которая выполняет ход и обновляет состояние
  const operate = (getNewBoard: () => number[][]) => {
    const newBoard = getNewBoard();
    const boardChanged = JSON.stringify(board) !== JSON.stringify(newBoard);

    if (boardChanged) {
      const finalBoard = addRandomTile(newBoard);
      setBoard(finalBoard);
    }
  };

  // Движение
  const moveLeft = () => {
    operate(() => board.map(processLine));
  };

  const moveRight = () => {
    operate(() => {
      return board.map((row) => {
        // Движение вправо = развернуть -> сдвинуть влево -> развернуть обратно
        return processLine([...row].reverse()).reverse();
      });
    });
  };

  const moveUp = () => {
    operate(() => {
      // Движение вверх = транспонировать -> сдвинуть влево -> транспонировать обратно
      const transposed = transpose(board);
      const moved = transposed.map(processLine);
      return transpose(moved);
    });
  };

  const moveDown = () => {
    operate(() => {
      // Движение вниз = транспонировать -> сдвинуть вправо -> транспонировать обратно
      const transposed = transpose(board);
      const moved = transposed.map((row) =>
        processLine([...row].reverse()).reverse(),
      );
      return transpose(moved);
    });
  };

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

  // Инициализация игры
  const initializeGame = () => {
    let board = createEmptyBoard(rows, cols);
    board = addRandomTile(board);
    board = addRandomTile(board);
    setBoard(board);
  };
  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <div className='rounded-lg bg-slate-400 p-2 shadow-2xl dark:bg-slate-700'>
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
  );
}
