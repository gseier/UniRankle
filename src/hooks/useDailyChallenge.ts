import { useMemo } from 'react';
import type { University } from '../types/University';
import universityData from '../data/unis.json';

/**
 * Hook to manage the state of the daily university challenge data.
 * @returns An object containing the initial list for the user and the definitive correct order.
 */
export const useDailyChallenge = () => {
  const allUniversities: University[] = universityData as University[];

  // 1. Determine the list for the day. (Since the mock is small, we use all of it).
  const dailyUniversities: University[] = useMemo(() => {
    // In a real app, this would use local storage or a date check for daily randomness.
    return allUniversities;
  }, [allUniversities]);

  // 2. Determine the definitively correct order by sorting the selected list.
  const correctOrder: University[] = useMemo(() => {
    // Sort by the 'ranking' property to get the true result.
    return [...dailyUniversities].sort((a, b) => a.ranking - b.ranking);
  }, [dailyUniversities]);

  return { dailyUniversities, correctOrder };
};