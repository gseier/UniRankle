import type { University } from './University';

export type RankingByApi = 'RANKING' | 'STUDENT_COUNT';

export interface DailyResponse {
  dateKey: string;
  rankingBy: RankingByApi;
  universities: University[];
}

export interface SubmitResponse {
  score: number;
  maxPossibleScore: number;
  averageScore: number;
  submissionsCount: number;
}
