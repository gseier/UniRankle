import { useEffect, useMemo, useState } from 'react';
import type { University } from '../types/University';
import type { DailyResponse, RankingByApi } from '../types/api';

const CHALLENGE_COUNT = 5;

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useDailyChallenge = () => {
  const [rankingByApi, setRankingByApi] = useState<RankingByApi>('RANKING');
  const [universities, setUniversities] = useState<University[]>([]);
  const [dateKey, setDateKey] = useState<string>('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/daily', { credentials: 'include' });
      const data: DailyResponse = await res.json();
      setRankingByApi(data.rankingBy);
      setUniversities(data.universities);
      setDateKey(data.dateKey);
    })();
  }, []);

  const rankingBy = useMemo<'ranking' | 'studentCount'>(() => {
    return rankingByApi === 'STUDENT_COUNT' ? 'studentCount' : 'ranking';
  }, [rankingByApi]);

  const { initialDisplayOrder, correctOrder } = useMemo(() => {
    if (universities.length !== CHALLENGE_COUNT) {
      return { initialDisplayOrder: [], correctOrder: [] as University[] };
    }
    const correctList = [...universities].sort((a, b) => {
      if (rankingBy === 'studentCount') return b.studentCount - a.studentCount;
      return a.ranking - b.ranking;
    });
    const initialDisplay = shuffleArray(universities);
    return { initialDisplayOrder: initialDisplay, correctOrder: correctList };
  }, [universities, rankingBy]);

  return { dateKey, dailyUniversities: initialDisplayOrder, correctOrder, rankingBy };
};