export interface DataPoint {
  time: number;
  wpm: number;
  rawWpm: number;
  mistakes: number;
}

export interface SingleDataPoint {
  [key: number]: number;
}
