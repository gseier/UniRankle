import React, { useState, useCallback } from 'react';
import SortableItem from './SortableItem';
import Scoreboard from './Scoreboard';
import { useDailyChallenge } from '../hooks/useDailyChallenge';
import { arrayMove, calculateScore, calculateMaxScore } from '../utils/dndUtils';
import type { University } from '../types/University';
import type { SubmitResponse } from '../types/api';
import { MdOutlineLocalLibrary } from 'react-icons/md';

const formatRankingVariable = (key: 'ranking' | 'studentCount') => {
  switch (key) {
    case 'ranking': return 'Global Rank';
    case 'studentCount': return 'Student Count';
    default: return 'Unknown Metric';
  }
};

const RankingList: React.FC = () => {
  const { dateKey, dailyUniversities, correctOrder, rankingBy } = useDailyChallenge();
  const [universities, setUniversities] = useState<University[]>(dailyUniversities);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  React.useEffect(() => { setUniversities(dailyUniversities); }, [dailyUniversities]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const id = e.currentTarget.getAttribute('data-id');
    if (id) {
      e.dataTransfer.setData('text/plain', id);
      setTimeout(() => setDraggedId(id), 0);
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSubmitted || !draggedId) return;
    const targetElement = e.currentTarget;
    const targetId = targetElement.getAttribute('data-id');
    if (draggedId === targetId) return;
    const fromIndex = universities.findIndex((uni) => uni.id === draggedId);
    const toIndex = universities.findIndex((uni) => uni.id === targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      setUniversities((prevUnis) => arrayMove(prevUnis, fromIndex, toIndex));
    }
  }, [universities, draggedId, isSubmitted]);

  const handleDragEnd = useCallback(() => setDraggedId(null), []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitted) return;
    const order = universities.map((u) => u.id);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, order }),
      });
      const data: SubmitResponse = await res.json();

      const localScore = calculateScore(universities, correctOrder);
      setScore(Number.isFinite(data?.score) ? data.score : localScore);
      setAverageScore(data?.averageScore ?? null);
      setIsSubmitted(true);
    } catch {
      const localScore = calculateScore(universities, correctOrder);
      setScore(localScore);
      setIsSubmitted(true);
    }
  }, [isSubmitted, universities, correctOrder, dateKey]);

  const maxPossibleScore = calculateMaxScore(universities.length);

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased py-8">
      <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-6xl sm:text-7xl font-black bg-clip-text text-transparent animated-title bg-gradient-to-r from-academic-indigo via-academic-orange to-academic-cream tracking-tightest leading-none">
            UniRankle
          </h1>
          <p className="text-gray-700 mt-4 max-w-xl mx-auto text-lg border-t pt-4">
            Today's challenge:
            <br />
            Rank these five universities from 1 (Highest) to 5 (Lowest) based on
            <br />
            <b>{formatRankingVariable(rankingBy)}</b>
          </p>
        </header>

        <main className="space-y-8">
          <div className="md:col-span-1">
            <Scoreboard
              score={score}
              maxPossibleScore={maxPossibleScore}
              isSubmitted={isSubmitted}
              onSubmit={handleSubmit}
              averageScore={averageScore}
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
              <MdOutlineLocalLibrary className="w-7 h-7 mr-2 text-academic-indigo" />
              Your Ranking
            </h2>
            <div className="space-y-4 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-100" aria-live="polite">
              {universities.map((uni, index) => {
                const correctIndex = correctOrder.findIndex((u) => u.id === uni.id);
                const correctRank = correctIndex !== -1 ? correctIndex + 1 : undefined;
                return (
                  <div key={uni.id} data-id={uni.id} data-index={index}
                       onDragStart={handleDragStart} onDragEnter={handleDragEnter}
                       onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}
                       className={`flex items-stretch space-x-4 transition-all duration-300 transform bg-gray-50 rounded-2xl shadow-md border-2 border-transparent ${isSubmitted ? 'cursor-default' : 'hover:shadow-lg'}`}>
                    {/* Left indicator */}
                    <div className={`flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center rounded-l-2xl font-bold text-center shadow-xl transition-colors duration-300 ml-3 my-3 py-2 ${
                      isSubmitted && correctRank === index + 1
                        ? 'bg-green-600 text-white'
                        : isSubmitted && correctRank && Math.abs(correctRank - (index + 1)) <= 1
                          ? 'bg-yellow-400 text-gray-800'
                          : isSubmitted
                            ? 'bg-red-500 text-white'
                            : 'bg-indigo-100 text-indigo-700'
                    }`} title={isSubmitted ? `Actual Rank Position: ${correctRank}` : `Your Rank: ${index + 1}`}>
                      <span className="text-sm leading-none">{isSubmitted ? 'Pos.' : 'Rank'}</span>
                      <span className="text-xl sm:text-2xl leading-none pt-1">{isSubmitted ? `#${correctRank}` : index + 1}</span>
                    </div>

                    {/* Draggable card */}
                    <div draggable={!isSubmitted} className={`flex-grow h-full py-2 pr-2 ${isSubmitted ? 'cursor-default' : 'cursor-grab'} transition-all duration-150`}>
                      {/* Reuse your existing UniversityCard */}
                      
                      <SortableItem
                        key={uni.id}
                        university={uni}
                        index={index}
                        onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter}
                        onDragEnd={handleDragEnd}
                        isDragging={false}
                        isSubmitted={isSubmitted}
                        correctRank={correctRank}
                        rankingBy={rankingBy}
                        correctValue={uni[rankingBy]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RankingList;