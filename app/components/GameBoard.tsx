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

  // Находит все пустые ячейки и возвращает их координаты
  const findEmptyCells = (): Cell[] => {
    const emptyCells: Cell[] = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue === 0) {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });
    return emptyCells;
  };

  // Добавляет одну фишку в случайную пустую ячейку
  const addRandomTile = () => {
    const emptyCells = findEmptyCells();
    if (emptyCells.length === 0) return; // Нет места

    const randomCell =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;

    // Важно: создаем копию доски для изменения
    const newBoard = board.map((row) => [...row]);
    newBoard[randomCell.row][randomCell.col] = newValue;
    setBoard(newBoard);
  };

  // Инициализация игры
  useEffect(() => {
    const newBoard = createEmptyBoard(rows, cols);
    const emptyCells: Cell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        emptyCells.push({ row: r, col: c });
      }
    }

    // Первая фишка
    let randomIndex = Math.floor(Math.random() * emptyCells.length);
    let randomCell = emptyCells.splice(randomIndex, 1)[0];
    newBoard[randomCell.row][randomCell.col] = 2;

    // Вторая фишка
    randomIndex = Math.floor(Math.random() * emptyCells.length);
    randomCell = emptyCells.splice(randomIndex, 1)[0];
    newBoard[randomCell.row][randomCell.col] = 2;

    setBoard(newBoard);
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
