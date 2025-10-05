import React, { useState, useCallback, useMemo } from 'react';
import UniversityCard from './UniversityCard'; // Imports the visual card component
import type { University } from '../types/University'; // Imports the TypeScript type
import universityData from '../data/unis.json'; // Imports the JSON data

// --- Utility Functions ---
/** Moves an item within an array using its original and new index. */
const arrayMove = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const newArray = [...array];
  const element = newArray[fromIndex];
  newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, element);
  return newArray;
};

// --- Sortable Item Wrapper Component ---
interface SortableItemProps {
  university: University;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isSubmitted: boolean;
  correctRank?: number;
}

const SortableItem: React.FC<SortableItemProps> = ({ 
  university, 
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isSubmitted,
  correctRank 
}) => {
  
  // Dynamic styling for rank indicator
  let rankBg = 'bg-indigo-100 text-indigo-700';
  let rankText = index + 1;

  if (isSubmitted && correctRank !== undefined) {
    if (correctRank === index + 1) {
      rankBg = 'bg-green-500 text-white'; // Correct
    } else if (Math.abs(correctRank - (index + 1)) <= 1) {
      rankBg = 'bg-yellow-400 text-gray-800'; // Close
    } else {
      rankBg = 'bg-red-400 text-white'; // Incorrect
    }
    rankText = correctRank;
  }
  
  const dragStyle = isDragging ? 'opacity-50 border-dashed border-indigo-500' : 'border-solid border-gray-100';

  return (
    <div 
      data-id={university.id}
      data-index={index}
      draggable={!isSubmitted} // Only draggable before submission
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className={`
        flex items-center space-x-4 transition-all duration-300 transform 
        bg-gray-50 rounded-2xl py-2 shadow-sm
        ${isSubmitted ? 'cursor-default' : 'hover:shadow-md cursor-grab'}
      `}
    >
      
      {/* Rank Indicator */}
      <div 
        className={`
          flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full 
          font-bold text-xl shadow-lg transition-colors duration-300 ml-2 border-2 
          ${rankBg}
        `}
      >
        {rankText}
      </div>

      {/* The University Card */}
      <div className={`flex-grow ${dragStyle}`}>
        <UniversityCard university={university} isDragging={isDragging} />
      </div>
    </div>
  );
};


// --- Main RankingList Component ---
const RankingList: React.FC = () => {
  // Use useMemo to ensure the initial set of universities is only picked once.
  // We assume universityData is an array of University objects.
  const allUniversities: University[] = universityData as University[];
  
  // Logic to select 7 random universities for the daily challenge (adjust as needed)
  const initialDailyUniversities = useMemo(() => {
    const count = 7;
    const shuffled = [...allUniversities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, [allUniversities]);

  const [universities, setUniversities] = useState<University[]>(initialDailyUniversities);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  // The definitively correct order, sorted by the 'ranking' property.
  const CORRECT_ORDER = useMemo(() => {
    return [...initialDailyUniversities].sort((a, b) => a.ranking - b.ranking);
  }, [initialDailyUniversities]);

  // --- Native D&D Logic ---
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const id = e.currentTarget.getAttribute('data-id');
    if (id) {
      e.dataTransfer.setData('text/plain', id);
      setTimeout(() => setDraggedId(id), 0); 
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSubmitted || !draggedId) return;
    
    const targetId = e.currentTarget.getAttribute('data-id');

    if (draggedId === targetId) return;

    const fromIndex = universities.findIndex(uni => uni.id === draggedId);
    const toIndex = universities.findIndex(uni => uni.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      setUniversities(prevUnis => arrayMove(prevUnis, fromIndex, toIndex));
    }
  }, [universities, draggedId, isSubmitted]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);
  // --- End Native D&D Logic ---

  /** Calculates score based on positional accuracy. */
  const calculateScore = (userRanks: University[]): number => {
    let currentScore = 0;
    
    userRanks.forEach((userUni, userIndex) => {
      const correctIndex = CORRECT_ORDER.findIndex(correctUni => correctUni.id === userUni.id);
      const difference = Math.abs(userIndex - correctIndex);
      
      const points = userRanks.length - 1 - difference;
      
      if (points > 0) currentScore += points;
    });

    return currentScore;
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const finalScore = calculateScore(universities);
    setScore(finalScore);
    setIsSubmitted(true);
  };
  
  // Calculate max score
  const maxPossibleScore = universities.length * (universities.length - 1) / 2;

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased py-8">
      <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-800 tracking-tight">
            UniRank Daily Challenge
          </h1>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto text-lg">
            Drag these **{universities.length}** universities to rank them from 1 (Highest) to {universities.length} (Lowest) based on Global Rank.
          </p>
        </header>

        <main className="grid md:grid-cols-3 gap-8">
          
          {/* Ranking List Column */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">
              Your Ranking
            </h2>
            <div 
              className="space-y-4 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-100"
              aria-live="polite"
            >
              {universities.map((uni, index) => {
                const correctIndex = CORRECT_ORDER.findIndex(correctUni => correctUni.id === uni.id);
                const correctRank = correctIndex !== -1 ? correctIndex + 1 : undefined;

                return (
                  <SortableItem 
                    key={uni.id} 
                    university={uni} 
                    index={index} 
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedId === uni.id}
                    isSubmitted={isSubmitted}
                    correctRank={correctRank}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Scoreboard Column */}
          <div className="md:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              <div className="bg-indigo-50 p-6 rounded-2xl shadow-xl border border-indigo-200">
                <h2 className="text-2xl font-bold text-indigo-700 mb-3">
                  Game Status
                </h2>
                
                {isSubmitted ? (
                  <div className="text-center">
                    <p className="text-lg text-gray-700 font-medium">Your Final Score:</p>
                    <p className="text-6xl font-extrabold text-green-600 my-2">
                      {score} / {maxPossibleScore}
                    </p>
                    <p className="text-sm text-gray-500">
                      Perfect score means your ranking perfectly matched the actual Global Rank.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-700">
                    <p className="text-lg font-semibold">Ready to test your knowledge?</p>
                    <p className="text-sm mt-1">
                      Drag and drop the universities until you're satisfied with your list.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitted}
                className={`
                  w-full py-4 rounded-xl text-xl font-bold transition-all duration-300 transform
                  ${isSubmitted 
                    ? 'bg-gray-400 cursor-not-allowed shadow-inner' 
                    : 'bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 hover:shadow-3xl active:scale-[0.99]'}
                `}
              >
                {isSubmitted ? 'Challenge Complete!' : 'Submit My Ranking'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RankingList;