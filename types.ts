export type Step = 'setup' | 'voting' | 'results';

export interface ResultData {
  name: string;
  votes: number;
  percentage: string;
  isWinner?: boolean;
}

export type CalculationMode = 'totalBallots' | 'validBallots';

export interface InvalidBallotCriteria {
  moreThanRequired: boolean;
  lessThanRequired: boolean;
  blank: boolean;
}

export interface ElectionResults {
  results: ResultData[];
  totalVotes: number;
  totalBallots: number;
  validBallots: number;
  invalidBallots: number;
  validityNote: string;
  winners: ResultData[];
}
