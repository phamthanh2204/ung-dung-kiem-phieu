export type Step = 'setup' | 'voting' | 'results';

export interface ResultData {
  name: string;
  votes: number;
  percentage: string;
  isWinner?: boolean;
}

export type CalculationMode = 'totalBallots' | 'validBallots';
