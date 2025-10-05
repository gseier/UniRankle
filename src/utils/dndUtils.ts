import type { University } from '../types/University';

/**
 * Utility function to move an item within an array.
 */
export const arrayMove = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const newArray = [...array];
  const element = newArray[fromIndex];
  newArray.splice(fromIndex, 1); // Remove from old spot
  newArray.splice(toIndex, 0, element); // Insert into new spot
  return newArray;
};

/**
 * Calculates a score based on how many universities the user placed in the EXACT correct position.
 * The max score is equal to the number of universities (e.g., 5).
 */
export const calculateScore = (userRanks: University[], correctOrder: University[]): number => {
    let correctCount = 0;
    
    userRanks.forEach((userUni, userIndex) => {
      // Check if the university at the user's index (userUni) is the same as 
      // the university in the correct list at that same index.
      if (userUni.id === correctOrder[userIndex].id) {
        correctCount += 1;
      }
    });

    return correctCount;
};

/**
 * Calculates the maximum possible score (which is simply the count of items).
 */
export const calculateMaxScore = (N: number): number => {
  // Max score is the number of items placed correctly.
  return N;
}

export type RankVariable = keyof University | 'studentCount';