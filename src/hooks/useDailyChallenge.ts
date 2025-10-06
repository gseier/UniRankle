import { useMemo } from 'react';
import type { University } from '../types/University';
import universityData from '../data/unis.json';
import type { RankVariable } from '../utils/dndUtils';

// Define all possible variables a user might have to rank by
const RANKING_VARIABLES: RankVariable[] = ['ranking', 'studentCount'];
const CHALLENGE_COUNT = 5; // The required number of universities per game

// --- HELPER FUNCTIONS ---
const getRandomElement = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
// ----------------------------

/**
 * Hook to manage the state of the daily university challenge data.
 */
export const useDailyChallenge = () => {
  const allUniversities: University[] = universityData as University[];

  // 1. Determine the ranking variable for the day
  const rankingBy: RankVariable = useMemo(() => {
    return getRandomElement(RANKING_VARIABLES);
  }, []);

  const { initialDisplayOrder, correctOrder } = useMemo(() => {
    // 2. Select 5 unique random universities
    const shuffledAll = shuffleArray(allUniversities);
    const selectedUniversities = shuffledAll.slice(0, CHALLENGE_COUNT);

    // 3. Determine the definitively correct order based on the 'rankingBy' variable
    const correctList = [...selectedUniversities].sort((a, b) => {
        const valA = a[rankingBy];
        const valB = b[rankingBy];

        if (typeof valA === 'number' && typeof valB === 'number') {
            if (rankingBy === 'studentCount') {
                // Sort descendingly for studentCount (Highest to Lowest)
                return valB - valA; 
            } else {
                // Sort ascendingly for 'ranking' (Lowest Rank number is highest position)
                return valA - valB;
            }
        }
        return 0;
    });

    // 4. Randomize the initial list presented to the user
    const initialDisplay = shuffleArray(selectedUniversities);

    return { initialDisplayOrder: initialDisplay, correctOrder: correctList };

  }, [allUniversities, rankingBy]); 

  return { dailyUniversities: initialDisplayOrder, correctOrder, rankingBy };
};