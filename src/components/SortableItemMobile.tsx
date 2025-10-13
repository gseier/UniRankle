import React from 'react';
import UniversityCard from './UniversityCard';
import type { University } from '../types/University';
import type { RankVariable } from '../utils/dndUtils';

interface SortableItemMobileProps {
  university: University;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isSubmitted: boolean;
  correctRank?: number;
  rankingBy: RankVariable;
  correctValue: number | string;
}

const SortableItemMobile: React.FC<SortableItemMobileProps> = ({
  university,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isSubmitted,
  correctRank,
  rankingBy,
}) => {
  // --- Rank indicator styling ---
  let rankBg = 'bg-indigo-100 text-indigo-700';
  let rankText: string | number = `Rank ${index + 1}`;

  if (isSubmitted && correctRank !== undefined) {
    if (correctRank === index + 1) {
      rankBg = 'bg-green-600 text-white';
    } else if (Math.abs(correctRank - (index + 1)) <= 1) {
      rankBg = 'bg-yellow-400 text-gray-800';
    } else {
      rankBg = 'bg-red-500 text-white';
    }
    rankText = `#${correctRank}`;
  }

  const dragStyle = isDragging ? 'opacity-80 scale-[0.98] border-indigo-400' : 'border-gray-200';

  return (
    <div
      data-id={university.id}
      data-index={index}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      draggable={!isSubmitted}
      className={`
        relative bg-white rounded-xl overflow-hidden shadow-md border transition-all duration-200 
        ${dragStyle} ${isSubmitted ? 'cursor-default' : 'cursor-grab active:scale-[0.98]'}
      `}
    >
      {/* Floating rank tag */}
      <div
        className={`
          absolute top-2 left-2 px-2 py-[2px] rounded-md text-[0.7rem] font-bold shadow-sm
          ${rankBg}
        `}
      >
        {rankText}
      </div>

      {/* University content */}
      <div className="flex flex-col">
        <UniversityCard
          university={university}
          isDragging={isDragging}
          isSubmitted={isSubmitted}
          rankingBy={rankingBy}
          correctValue={university[rankingBy]}
        />
      </div>
    </div>
  );
};

export default SortableItemMobile;
