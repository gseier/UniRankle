import React from 'react';
import type { University } from '../types/University';

interface UniversityCardProps {
  university: University;
  isDragging?: boolean; 
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university, isDragging = false }) => {
  const fallbackText = university.name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
  const fallbackImageUrl = `https://placehold.co/300x120/3B82F6/FFFFFF?text=${fallbackText}`;

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
      
      {/* 1. Image Area (Top) */}
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
        {/* Subtle Fade-out Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/70 to-transparent"></div>
      </div>

      {/* 2. Text Content (Bottom) */}
      <div className="flex-grow text-left p-4 pb-3 flex justify-between items-center">
        
        {/* University Details */}
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 truncate leading-tight">
            {university.name}
          </h3>
          <p className="text-xs sm:text-sm text-indigo-600 font-medium mt-1">
            Students: {university.studentCount.toLocaleString()}
          </p>
        </div>

        {/* Drag Handle Icon */}
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