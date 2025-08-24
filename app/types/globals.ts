export type Tile = {
  id: number;
  value: number;
};

export type Board = Tile[][];

export type Direction = 'left' | 'right' | 'up' | 'down';
