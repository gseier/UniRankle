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

const UniversityCard: React.FC<UniversityCardProps> = ({ 
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
    flex flex-col bg-white border-2 border-transparent
    rounded-2xl transition-all duration-300 w-full max-w-full
    shadow-lg overflow-hidden
    ${isDragging ? 'dragging' : 'hover:shadow-xl'}
  `}
  aria-label={`University Card for ${university.name}`}
>
  {/* Image */}
  <div className="relative w-full h-28 sm:h-32 overflow-hidden">
    <img
      src={university.imageUrl}
      alt={`View of ${university.name} campus`}
      className="w-full h-full object-cover select-none pointer-events-none touch-none"
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
      onError={(e) => {
        const t = e.target as HTMLImageElement;
        t.src = fallbackImageUrl;
        t.className = 'w-full h-full object-contain p-4 bg-gray-200 select-none pointer-events-none';
      }}
    />
    <div
      className={`absolute inset-0 bg-gray-900/70 flex items-center justify-center p-2 text-center transition-opacity duration-500
      ${isSubmitted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div>
        <p className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide">Correct {variableLabel}</p>
        <p className={`text-2xl sm:text-3xl font-extrabold ${valueColor}`}>{displayValue}</p>
      </div>
    </div>
  </div>

  {/* Text */}
  <div className="flex justify-between items-center p-3 sm:p-4">
    <div className="min-w-0">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate max-w-[70vw] sm:max-w-full">
        {university.name}
      </h3>
      <p className="text-xs sm:text-sm text-indigo-600 mt-1">{university.country}</p>
    </div>

    <div className="flex-shrink-0 ml-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 hover:text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  </div>
</div>

  );
};

export default UniversityCard;