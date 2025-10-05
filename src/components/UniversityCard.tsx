import React from 'react';
import type { University } from '../types/University';

// Define the component's props, expecting a single University object
interface UniversityCardProps {
  university: University;
  // This prop would typically be passed by the Drag-and-Drop library to handle interaction
  // For now, we keep the UI focused on presentation.
  isDragging?: boolean; 
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university, isDragging = false }) => {
  // Determine a fallback image if the URL is missing or broken
  const fallbackImageUrl = `https://placehold.co/100x100/A0BFFF/000000?text=${university.name.substring(0, 1)}`;

  return (
    // The main container. We use transition and hover effects for a modern, interactive feel.
    <div
      className={`
        flex items-center p-3 sm:p-4 my-2 bg-white border-2 border-transparent 
        rounded-xl shadow-lg transition-all duration-300 ease-in-out cursor-grab 
        transform hover:shadow-2xl hover:scale-[1.02]
        ${isDragging ? 'shadow-2xl ring-4 ring-indigo-300 border-indigo-400 scale-[1.03]' : ''}
      `}
      aria-label={`University Card for ${university.name}`}
    >
      
      {/* University Image or Placeholder */}
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 mr-4">
        <img
          src={university.imageUrl}
          alt={`View of ${university.name} campus`}
          // Styling for the image: object-cover ensures it fills the space cleanly
          className="w-full h-full object-cover rounded-lg shadow-md"
          // Fallback mechanism if the provided image URL fails
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // prevents infinite loop
            target.src = fallbackImageUrl; // Fallback to a placeholder image
          }}
        />
      </div>

      {/* University Details */}
      <div className="flex-grow text-left min-w-0">
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 truncate">
          {university.name}
        </h3>
        <p className="text-sm sm:text-base text-indigo-600 font-medium">
          Global Rank: #{university.ranking}
        </p>
      </div>

      {/* Visual Drag Handle or Separator (Optional but good UX) */}
      <div className="flex-shrink-0 ml-4 pl-4 border-l-2 border-gray-100 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold uppercase text-gray-400 mb-1">
          Drag to Rank
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-500 hover:text-indigo-600 transition-colors"
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
