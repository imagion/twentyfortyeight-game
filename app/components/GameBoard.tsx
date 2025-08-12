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

  // Движение
  const moveLeft = () => {
    console.log('left');
    let boardChanged = false;
    const newBoard = board.map((row) => [...row]);

    newBoard.forEach((row, rowIndex) => {
      // Сдвиг
      const numbersOnly = row.filter((value) => value !== 0);
      const zeroes = Array(row.length - numbersOnly.length).fill(0);
      const newRow = numbersOnly.concat(zeroes);

      newBoard[rowIndex] = newRow;

      // Слияние
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          newRow[i + 1] = 0;
        }
      }

      // Финальный сдвиг
      const afterMergeRow = newRow;
      const finalNumbers = afterMergeRow.filter((value) => value !== 0);
      const finalZeroes = Array(
        afterMergeRow.length - finalNumbers.length,
      ).fill(0);
      const finalRow = finalNumbers.concat(finalZeroes);

      newBoard[rowIndex] = finalRow;

      // Сравниваем строки через JSON, чтобы корректно определить изменения
      if (JSON.stringify(finalRow) !== JSON.stringify(board[rowIndex])) {
        boardChanged = true;
      }
    });

    // Обновляем доску и добавляем фишку, только если были изменения
    if (boardChanged) {
      setBoard(newBoard);
      addRandomTile();
    }
  };
  const moveRight = () => {
    console.log('right');
  };
  const moveUp = () => {
    console.log('up');
  };
  const moveDown = () => {
    console.log('down');
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
