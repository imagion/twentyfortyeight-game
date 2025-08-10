'use client';

import { useEffect, useState } from 'react';

export default function GameBoard() {
  const rows = 4;
  const cols = 4;

  const [board, setBoard] = useState(Array(rows * cols).fill(0));

  const findEmptyCells = () => {
    const emptyCells: number[] = [];
    board.forEach((cell, index) => {
      if (cell === 0) {
        emptyCells.push(index);
      }
    });
    return emptyCells;
  };

  const addTwoTiles = () => {
    const emptyCells = findEmptyCells();

    if (emptyCells.length < 2) return; // если меньше 2 пустых, нет смысла

    // Перемешиваем
    const shuffled = emptyCells.sort(() => Math.random() - 0.5);

    // Берём первые две
    const [first, second] = shuffled;

    // Копия поля, чтобы не мутировать напрямую
    const newBoard = [...board];
    newBoard[first] = Math.random() < 0.9 ? 2 : 4;
    newBoard[second] = Math.random() < 0.9 ? 2 : 4;

    setBoard(newBoard);
  };

  useEffect(() => {
    addTwoTiles();
  }, []);

  return (
    <div className='rounded-lg bg-slate-200 p-2 shadow-2xl dark:bg-slate-700'>
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
        {board.map((value, index) => (
          <div
            key={index}
            className='rounded-md bg-slate-100 dark:bg-slate-900'>
            {value === 0 ? '' : value}
          </div>
        ))}
      </div>
    </div>
  );
}
