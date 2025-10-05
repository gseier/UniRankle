import React from 'react';
import UniversityCard from './UniversityCard';
import type { University } from '../types/University';

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
        bg-gray-50 rounded-2xl shadow-md border-2 border-transparent hover:border-indigo-300
        ${isSubmitted ? 'cursor-default' : 'hover:shadow-lg cursor-grab'}
      `}
    >
      
      {/* Rank Indicator */}
      <div 
        className={`
          flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full 
          font-bold text-2xl shadow-xl transition-colors duration-300 ml-3
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

export default SortableItem;