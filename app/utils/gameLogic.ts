import { Board, Tile } from '@/types/globals';

const ROWS = 4;
const COLS = 4;

export const createEmptyBoard = (): Board => {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ id: 0, value: 0 })),
  );
};

export const placeRandomTile = (board: Board, idToUse: number): Board => {
  const emptyCells: { row: number; col: number }[] = [];
  board.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (tile.value === 0) emptyCells.push({ row: r, col: c });
    });
  });

  if (emptyCells.length === 0) return board;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newValue = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map((row) => row.map((tile) => ({ ...tile })));
  newBoard[randomCell.row][randomCell.col] = { id: idToUse, value: newValue };
  return newBoard;
};

export const slideAndMergeLine = (
  line: Tile[],
): { line: Tile[]; points: number } => {
  const tiles = line.filter((tile) => tile.value !== 0);
  const processedLine: Tile[] = [];
  let points = 0;

  for (let i = 0; i < tiles.length; i++) {
    if (i < tiles.length - 1 && tiles[i].value === tiles[i + 1].value) {
      const mergedValue = tiles[i].value * 2;
      // При слиянии мы сохраняем ID второй плитки.
      // Это позволяет framer-motion анимировать "влет" первой плитки во вторую.
      processedLine.push({ id: tiles[i + 1].id, value: mergedValue });
      points += mergedValue;
      i++; // Вместо обнуления следующей плитки, пропускаем, что избавляет от финального фильтра
    } else {
      processedLine.push(tiles[i]);
    }
  }

  const finalLine = processedLine.concat(
    Array.from({ length: line.length - processedLine.length }, () => ({
      id: 0,
      value: 0,
    })),
  );

  return { line: finalLine, points };
};

export const transpose = (board: Board): Board => {
  const transposed = createEmptyBoard();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      transposed[c][r] = board[r][c];
    }
  }
  return transposed;
};

export const boardsEqual = (a: Board, b: Board): boolean => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (a[r][c].value !== b[r][c].value) return false;
    }
  }
  return true;
};

export const checkGameOver = (board: Board): boolean => {
  if (board.some((row) => row.some((tile) => tile.value === 0))) return false;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1 && board[r][c].value === board[r][c + 1].value)
        return false;
      if (r < ROWS - 1 && board[r][c].value === board[r + 1][c].value)
        return false;
    }
  }

  return true;
};
