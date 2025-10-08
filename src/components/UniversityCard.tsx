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
        flex flex-col p-0 bg-white border-2 border-transparent 
        rounded-2xl transition-all duration-300 w-full shadow-lg overflow-hidden
        ${isDragging 
          ? 'opacity-80 scale-[0.98] border-indigo-500' 
          : 'hover:shadow-xl'}
      `}
      aria-label={`University Card for ${university.name}`}
    >
      
      {/* 1. Image Area (Top) with Submission Overlay */}
      <div className="relative w-full h-32 overflow-hidden">
        <img
          src={university.imageUrl}
          alt={`View of ${university.name} campus`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = fallbackImageUrl;
            target.className = "w-full h-full object-contain p-4 bg-gray-200"; 
          }}
        />
        {/* Submission Overlay (The Graph/Reveal) */}
        <div 
            className={`absolute inset-0 bg-gray-900/70 transition-opacity duration-500 flex items-center justify-center p-4
            ${isSubmitted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className="text-center">
                <p className="text-sm font-light uppercase tracking-wider text-gray-300">
                    Correct {variableLabel}
                </p>
                <p className={`text-4xl font-extrabold ${valueColor} mt-1`}>
                    {displayValue}
                </p>
            </div>
        </div>
        
        {/* Subtle Fade-out Gradient Overlay (Only visible before submission) */}
        <div className={`absolute inset-0 bg-gradient-to-t from-gray-50/70 to-transparent ${isSubmitted ? 'opacity-0' : 'opacity-100'}`}></div>
      </div>

      {/* 2. Text Content (Bottom) */}
      <div className="flex-grow text-left p-4 pb-3 flex justify-between items-center">
        
        {/* University Details */}
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 truncate leading-tight">
            {university.name}
          </h3>
          <p className="text-xs sm:text-sm text-indigo-600 font-medium mt-1">
            {university.country}
          </p>
        </div>

        {/* Drag Handle Icon (Visual only) */}
        <div className="flex-shrink-0 ml-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400 hover:text-indigo-600 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>

      </div>
    </div>
  );
};

export default UniversityCard;