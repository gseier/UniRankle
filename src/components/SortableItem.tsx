import React from 'react';
import UniversityCard from './UniversityCard';
import type { University } from '../types/University';
import type { RankVariable } from '../utils/dndUtils';

interface SortableItemProps {
  university: University;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isSubmitted: boolean;
  correctRank?: number;
  rankingBy: RankVariable;
  correctValue: number | string; // Type definition remains, but is passed to child
}

const SortableItem: React.FC<SortableItemProps> = ({ 
  university, 
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isSubmitted,
  correctRank,
  rankingBy,
  // Removed correctValue from destructuring to fix "unused" error
}) => {
  
  // Dynamic styling for rank indicator
  let rankBg = 'bg-indigo-100 text-indigo-700';
  let rankText: string | number = index + 1;
  let indicatorTooltip = `Your Rank: ${index + 1}`;

  if (isSubmitted && correctRank !== undefined) {
    if (correctRank === index + 1) {
      rankBg = 'bg-green-600 text-white'; // Correct Placement
    } else if (Math.abs(correctRank - (index + 1)) <= 1) {
      rankBg = 'bg-yellow-400 text-gray-800'; // Close Placement
    } else {
      rankBg = 'bg-red-500 text-white'; // Incorrect Placement
    }
    
    // Display the correct RANK position on submission (for the left indicator)
    rankText = `#${correctRank}`;
    indicatorTooltip = `Actual Rank Position: ${correctRank}`;
  }
  
  // Drag style is now applied to the draggable section only
  const dragStyle = isDragging ? 'opacity-80 scale-[0.99] border-dashed border-indigo-500' : 'border-solid border-gray-100';

  return (
  <div
    data-id={university.id}
    data-index={index}
    onDragStart={onDragStart}
    onDragEnter={onDragEnter}
    onDragEnd={onDragEnd}
    onDragOver={(e) => e.preventDefault()}
    className={`flex flex-wrap sm:flex-nowrap items-stretch gap-3 
                transition-all duration-300 transform bg-gray-50 
                rounded-2xl shadow-md border-2 border-transparent 
                ${isSubmitted ? 'cursor-default' : 'hover:shadow-lg'}`}
  >
    {/* Rank Indicator */}
    <div
      className={`
        flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center
        rounded-l-2xl font-bold text-center shadow-md ml-3 my-3 py-2 ${rankBg}
      `}
      title={indicatorTooltip}
    >
      <span className="text-xs sm:text-sm">{isSubmitted ? 'Pos.' : 'Rank'}</span>
      <span className="text-lg sm:text-xl pt-1">{rankText}</span>
    </div>

    {/* Draggable Card */}
    <div
      draggable={!isSubmitted}
      className={`flex-grow ${isSubmitted ? 'cursor-default' : 'cursor-grab'} ${dragStyle}`}
    >
      {!isDragging ? (
        <UniversityCard
          university={university}
          isDragging={isDragging}
          isSubmitted={isSubmitted}
          rankingBy={rankingBy}
          correctValue={university[rankingBy]}
        />
      ) : (
        <div className="invisible h-full">
          {/* invisible placeholder to preserve layout height */}
          <UniversityCard
            university={university}
            isDragging={false}
            isSubmitted={isSubmitted}
            rankingBy={rankingBy}
            correctValue={university[rankingBy]}
          />
        </div>
      )}
    </div>
  </div>
);

};

export default SortableItem;