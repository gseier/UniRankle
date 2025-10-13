import React from 'react';
import type { University } from '../types/University';
import type { RankVariable } from '../utils/dndUtils';

interface UniversityCardMobileProps {
  university: University;
  isDragging: boolean;
  isSubmitted: boolean;
  rankingBy: RankVariable;
  correctValue: number | string;
}

const fallbackImageUrl = '/fallback_university.jpg';

const UniversityCardMobile: React.FC<UniversityCardMobileProps> = ({
  university,
  isDragging,
  isSubmitted,
  correctValue,
}) => {
  const displayValue =
    typeof correctValue === 'number'
      ? correctValue.toLocaleString()
      : correctValue;

  let valueColor = 'text-indigo-600';
  if (isSubmitted) {
    valueColor = 'text-green-600';
  }

  return (
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
        {isSubmitted && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <p className={`text-base font-bold ${valueColor}`}>
              {displayValue}
            </p>
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
