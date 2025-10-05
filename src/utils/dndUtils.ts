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
 * Calculates a score based on how close the user's ranking is to the correct order.
 * @param userRanks The user's ranked list.
 * @param correctOrder The definitive correct list.
 * @returns The total score achieved.
 */
export const calculateScore = (userRanks: University[], correctOrder: University[]): number => {
    let currentScore = 0;
    
    userRanks.forEach((userUni, userIndex) => {
      // Find the correct index of this university in the CORRECT_ORDER list
      const correctIndex = correctOrder.findIndex(correctUni => correctUni.id === userUni.id);
      
      // Calculate the difference in position
      const difference = Math.abs(userIndex - correctIndex);
      
      // Score calculation: max possible points (N-1) minus the difference
      // N = userRanks.length
      const points = userRanks.length - 1 - difference;
      
      if (points > 0) currentScore += points;
    });

    return currentScore;
};

/**
 * Calculates the maximum possible score for a list of N items.
 */
export const calculateMaxScore = (N: number): number => {
  // Max score formula: N * (N - 1) / 2
  return N * (N - 1) / 2;
}