import { Board } from '@/types/globals';

const ROWS = 4;
const COLS = 4;

export const createEmptyBoard = (): Board => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
};

export const placeRandomTile = (boardState: Board): Board => {
  const emptyCells: { row: number; col: number }[] = [];
  boardState.forEach((row, r) => {
    row.forEach((cellValue, c) => {
      if (cellValue === 0) {
        emptyCells.push({ row: r, col: c });
      }
    });
  });

  if (emptyCells.length === 0) return boardState;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newValue = Math.random() < 0.9 ? 2 : 4;

  const newBoard = boardState.map((row) => [...row]);
  newBoard[randomCell.row][randomCell.col] = newValue;
  return newBoard;
};

export const slideAndMergeLine = (
  line: number[],
): { line: number[]; points: number } => {
  const numbersOnly = line.filter((value) => value !== 0);
  const shiftedLine = numbersOnly.concat(
    Array(line.length - numbersOnly.length).fill(0),
  );
  let gainedPoints = 0;

  for (let i = 0; i < shiftedLine.length - 1; i++) {
    if (shiftedLine[i] !== 0 && shiftedLine[i] === shiftedLine[i + 1]) {
      const mergedValue = shiftedLine[i] * 2;
      shiftedLine[i] = mergedValue;
      gainedPoints += mergedValue;
      shiftedLine[i + 1] = 0;
    }
  }

  const finalNumbers = shiftedLine.filter((value) => value !== 0);
  const finalLine = finalNumbers.concat(
    Array(shiftedLine.length - finalNumbers.length).fill(0),
  );

  return { line: finalLine, points: gainedPoints };
};

export const transpose = (boardToTranspose: Board): Board => {
  const transposed = createEmptyBoard();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      transposed[c][r] = boardToTranspose[r][c];
    }
  }
  return transposed;
};

export const boardsEqual = (a: Board, b: Board): boolean => {
  if (a.length !== b.length) return false;
  for (let r = 0; r < a.length; r++) {
    if (a[r].length !== b[r].length) return false;
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
};

export const checkGameOver = (boardToCheck: Board): boolean => {
  if (boardToCheck.some((row) => row.some((cell) => cell === 0))) {
    return false;
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1 && boardToCheck[r][c] === boardToCheck[r][c + 1])
        return false;
      if (r < ROWS - 1 && boardToCheck[r][c] === boardToCheck[r + 1][c])
        return false;
    }
  }

  return true;
};
