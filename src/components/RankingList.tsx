import React, { useState, useCallback } from 'react';
import SortableItem from './SortableItem';
import Scoreboard from './Scoreboard';
import { useDailyChallenge } from '../hooks/useDailyChallenge';
import { arrayMove, calculateScore, calculateMaxScore } from '../utils/dndUtils';
import type { University } from '../types/University';
import { MdOutlineLocalLibrary } from 'react-icons/md';

// Helper function to format the ranking variable for display
const formatRankingVariable = (key: keyof University | 'studentCount') => {
    switch (key) {
        case 'ranking':
            return 'Global Rank';
        case 'studentCount':
            return 'Student Count';
        default:
            return 'Unknown Metric';
    }
}

// --- Main RankingList Component ---
const RankingList: React.FC = () => {

    const { dailyUniversities, correctOrder, rankingBy, isLoading } = useDailyChallenge();
    
    

    const [universities, setUniversities] = useState<University[]>([]);

    React.useEffect(() => {
        setUniversities(dailyUniversities);
    }, [dailyUniversities]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [score, setScore] = useState<number | null>(null);
    

    // --- Native D&D Logic ---
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

        const fromIndex = universities.findIndex(uni => uni.id === draggedId);
        const toIndex = universities.findIndex(uni => uni.id === targetId);

        if (fromIndex !== -1 && toIndex !== -1) {
            setUniversities(prevUnis => arrayMove(prevUnis, fromIndex, toIndex));
        }
    }, [universities, draggedId, isSubmitted]);

    const handleDragEnd = useCallback(() => {
        setDraggedId(null);
    }, []);
    // --- End Native D&D Logic ---

    const handleSubmit = useCallback(() => {
        if (isSubmitted) return;

        const finalScore = calculateScore(universities, correctOrder);
        setScore(finalScore);
        setIsSubmitted(true);
        fetch('/api/saveScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore }),
        }).catch((err) => console.error('Failed to save score', err));
    }, [universities, correctOrder, isSubmitted]);
    
   

    if (isLoading) {
        return (
         <div className="flex items-center justify-center min-h-screen text-gray-600">
              Loading today’s challenge...
         </div>
         )
    }

    if (!dailyUniversities.length) {
        return (
          <div className="flex items-center justify-center min-h-screen text-gray-600">
           No universities found for today’s challenge.
         </div>
        )
    }

    
    const maxPossibleScore = calculateMaxScore(universities.length);

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased py-8">
            <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
                <header className="text-center mb-10">
                    <h1
                        className="
                            text-6xl sm:text-7xl font-black 
                            
                            /* CRITICAL: Text clipping and transparency */
                            bg-clip-text text-transparent
                            
                            /* Custom class for animation/size */
                            animated-title 
                            
                            /* THE GRADIENT: Uses your correctly defined colors */
                            bg-gradient-to-r from-academic-indigo via-academic-orange to-academic-cream
                            
                            tracking-tightest leading-none"
                        
                        // Ensure all inline styles are removed
                    >
                        UniRankle
                    </h1>
                    <p className="text-gray-700 mt-4 max-w-xl mx-auto text-lg border-t pt-4">
                        Today's challenge: 
                        <br />
                        Rank these five universities from 1 (Highest) to 5 (Lowest) based on 
                        <br/>
                        <b>{formatRankingVariable(rankingBy)}</b>
                    </p>
                    <link href="/src/style.css" rel="stylesheet"></link>
                </header>

                <main className="space-y-8">
                    
                    {/* 1. Scoreboard (Top) */}
                    <div className="md:col-span-1">
                        <Scoreboard
                            score={score}
                            maxPossibleScore={maxPossibleScore}
                            isSubmitted={isSubmitted}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    {/* 2. Ranking List (Bottom) */}
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
                            <MdOutlineLocalLibrary className="w-7 h-7 mr-2 text-academic-indigo" /> 
                            Your Ranking
                        </h2>
                        <div 
                            className="space-y-4 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-100"
                            aria-live="polite"
                        >
                            {universities.map((uni, index) => {
                                const correctIndex = correctOrder.findIndex(correctUni => correctUni.id === uni.id);
                                const correctRank = correctIndex !== -1 ? correctIndex + 1 : undefined;
                                
                                return (
                                    <SortableItem 
                                        key={uni.id} 
                                        university={uni} 
                                        index={index} 
                                        onDragStart={handleDragStart}
                                        onDragEnter={handleDragEnter}
                                        onDragEnd={handleDragEnd}
                                        isDragging={draggedId === uni.id}
                                        isSubmitted={isSubmitted}
                                        correctRank={correctRank}
                                        rankingBy={rankingBy}
                                        correctValue={uni[rankingBy]} 
                                    />
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
