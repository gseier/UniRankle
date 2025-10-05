import React from 'react';
import type { University } from '../types/University';

interface UniversityCardProps {
  university: University;
  isDragging?: boolean; 
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university, isDragging = false }) => {
  const fallbackImageUrl = `https://placehold.co/100x100/A0BFFF/000000?text=${university.name.substring(0, 2)}`;

  return (
    // FIX: The isDragging prop is now used to adjust the card's style visually.
    <div
      className={`
        flex items-center p-2 bg-white border-2 border-transparent 
        rounded-xl transition-all duration-300 w-full h-full shadow-lg
        ${isDragging 
          ? 'opacity-80 scale-[0.98] border-indigo-500' 
          : 'hover:shadow-xl'}
      `}
      aria-label={`University Card for ${university.name}`}
    >
      
      {/* University Image or Placeholder - Made taller (h-24/h-28) */}
      <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 mr-4">
        <img
          src={university.imageUrl}
          alt={`View of ${university.name} campus`}
          className="w-full h-full object-cover rounded-lg shadow-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = fallbackImageUrl;
          }}
        />
      </div>

      {/* University Details */}
      <div className="flex-grow text-left min-w-0 py-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 truncate leading-snug">
          {university.name}
        </h3>
        <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">
          Students: {university.studentCount.toLocaleString()}
        </p>
      </div>

      {/* Visual Drag Handle */}
      <div className="flex-shrink-0 ml-4 pl-4 border-l-2 border-gray-100 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-gray-400 hover:text-indigo-600 transition-colors"
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
  );
};

export default UniversityCard;
