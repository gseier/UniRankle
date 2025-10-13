import React from 'react';
import type { University } from '../types/University';
import type { RankVariable } from '../utils/dndUtils'; 

interface UniversityCardProps {
  university: University;
  isDragging?: boolean;
  isSubmitted?: boolean; 
  rankingBy?: RankVariable; 
  correctValue?: number | string; 
}

const formatValueDisplay = (key: RankVariable, value: number | string): string => {
    if (key === 'studentCount' && typeof value === 'number') {
        // Format large numbers for better display on the card
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    } else if (key === 'campusArea' && typeof value === 'number') {
        return value.toFixed(2) + ' sq km';
    }
    return String(value);
}

const UniversityCardMobile: React.FC<UniversityCardProps> = ({ 
  university, 
  isDragging = false,
  isSubmitted = false,
  rankingBy = 'ranking',
  correctValue
}) => {
  const fallbackText = university.name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
  const fallbackImageUrl = `https://placehold.co/300x120/3B82F6/FFFFFF?text=${fallbackText}`;

  const variableLabel = 
    rankingBy === 'ranking' ? 'Global Rank' : 
    rankingBy === 'studentCount' ? 'Student Count' : 
    rankingBy === 'yearFounded' ? 'Founding Year' : 
    rankingBy === 'campusArea' ? 'Campus Area' : 
    'Value';
  const displayValue = correctValue !== undefined ? formatValueDisplay(rankingBy, correctValue) : '';
  const valueColor = 
    rankingBy === 'ranking' ? 'text-yellow-300' : 
    rankingBy === 'studentCount' ? 'text-blue-300' : 
    rankingBy === 'yearFounded' ? 'text-purple-300' : 
    rankingBy === 'campusArea' ? 'text-red-300' : 
    'text-green-300';

  return (
    // Card Container
    <div
      className={`
        flex flex-col bg-white rounded-lg overflow-hidden
        w-full transition-all duration-200
        ${isDragging ? 'opacity-80 scale-[0.98]' : ''}
      `}
    >
      {/* Image */}
      <div className="relative w-full h-24 sm:h-28">
        <img
          src={university.imageUrl}
          alt={university.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.src = fallbackImageUrl;
            t.className = 'w-full h-full object-contain p-4 bg-gray-200';
          }}
        />

        {/* Overlay when submitted */}
        {isSubmitted && (
          <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center text-center px-2">
            <p className="text-[0.65rem] uppercase text-gray-300 tracking-wide">
              Correct {variableLabel}
            </p>
            <p className={`text-lg font-bold ${valueColor}`}>{displayValue}</p>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-2 text-left">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {university.name}
        </h3>
        <p className="text-[0.7rem] text-indigo-600">{university.country}</p>
      </div>
    </div>

  );
};

export default UniversityCardMobile;