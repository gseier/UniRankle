import React, { useState, useCallback, useEffect } from 'react';
import SortableItem from './SortableItem';
import Scoreboard from './Scoreboard';
import { useDailyChallenge } from '../hooks/useDailyChallenge';
import { arrayMove, calculateScore, calculateMaxScore } from '../utils/dndUtils';
import type { University } from '../types/University';
import { MdOutlineLocalLibrary, MdInsights } from 'react-icons/md';

const formatRankingVariable = (key: keyof University | 'studentCount') => {
  switch (key) {
    case 'ranking': return 'Global Rank';
    case 'studentCount': return 'Student Count';
    default: return 'Unknown Metric';
  }
};

const RankingList: React.FC = () => {
  const { dailyUniversities, correctOrder, rankingBy, isLoading } = useDailyChallenge();

  const [universities, setUniversities] = useState<University[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);

  const [userAvg, setUserAvg] = useState<number | null>(null)
  const [totalGames, setTotalGames] = useState<number>(0)

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      const res = await fetch('/api/userStats');
      const data = await res.json();
      if (res.ok) {
        setUserAvg(data.avgScore);
        setTotalGames(data.totalGames);
      }
    };
    fetchUserStats();
  }, []);

  // Load universities (and restore saved order if exists)
  useEffect(() => {
    const savedOrder = localStorage.getItem('uniOrder');
    if (savedOrder && dailyUniversities.length) {
      const ids = JSON.parse(savedOrder) as string[];
      const ordered = ids
        .map(id => dailyUniversities.find(u => u.id === id))
        .filter(Boolean) as University[];
      if (ordered.length === dailyUniversities.length) {
        setUniversities(ordered);
        return;
      }
    }
    setUniversities(dailyUniversities);
  }, [dailyUniversities]);

  // Countdown to next challenge
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            const diff = Math.max(0, tomorrow.getTime() - now.getTime());
            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setCountdown(`${hrs}h ${mins}m ${secs}s`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, []);


  // Check if player has already played today
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/checkPlayed');
      const data = await res.json();
      if (data.alreadyPlayed) {
        setAlreadyPlayed(true);
        setIsSubmitted(true);
        setPreviousScore(data.previousScore);
        const avgRes = await fetch('/api/getScores');
        const avgData = await avgRes.json();
        setAvgScore(avgData.average);
      }
    })().catch(() => {});
  }, []);

  // --- D&D logic ---
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const id = e.currentTarget.getAttribute('data-id');
    if (id) {
      e.dataTransfer.setData('text/plain', id);
      setTimeout(() => setDraggedId(id), 0);
    }
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isSubmitted || !draggedId) return;
      const targetId = e.currentTarget.getAttribute('data-id');
      if (draggedId === targetId) return;
      const fromIndex = universities.findIndex((u) => u.id === draggedId);
      const toIndex = universities.findIndex((u) => u.id === targetId);
      if (fromIndex !== -1 && toIndex !== -1) {
        setUniversities((prev) => arrayMove(prev, fromIndex, toIndex));
      }
    },
    [universities, draggedId, isSubmitted]
  );

  const handleDragEnd = useCallback(() => setDraggedId(null), []);

  // --- Submit handler ---
  const handleSubmit = useCallback(() => {
    if (isSubmitted || alreadyPlayed) return;
    const finalScore = calculateScore(universities, correctOrder);
    setScore(finalScore);
    setIsSubmitted(true);
    setAlreadyPlayed(true);
    setShowPopup(true);

    // Save order so it stays fixed
    localStorage.setItem('uniOrder', JSON.stringify(universities.map(u => u.id)));

    fetch('/api/saveScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: finalScore }),
    })
      .then(res => res.json())
      .then(async (data) => {
        if (data.success || data.alreadyPlayed) {
          const avgRes = await fetch('/api/getScores');
          const avgData = await avgRes.json();
          setAvgScore(avgData.average);
          setPreviousScore(data.previousScore ?? finalScore);
        }
      })
      .catch(err => console.error('Failed to save score', err));
  }, [universities, correctOrder, isSubmitted, alreadyPlayed]);

  // --- Loading states ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading today’s challenge...
      </div>
    );
  }

  if (!dailyUniversities.length) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No universities found for today’s challenge.
      </div>
    );
  }

  const maxPossibleScore = calculateMaxScore(universities.length);

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans antialiased py-8">
      <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
        <header className="text-center mb-10">
          <h1
            className="
              text-6xl sm:text-7xl font-black 
              bg-clip-text text-transparent
              animated-title 
              bg-gradient-to-r from-academic-indigo via-academic-orange to-academic-cream
              tracking-tightest leading-none"
          >
            UniRankle
          </h1>
          
          <p className="text-gray-700 mt-4 max-w-xl mx-auto text-lg border-t pt-4">
            Today's challenge:
            <br />
            Rank these five universities from 1 (Highest) to 5 (Lowest) based on
            <br />
            <span className="flex items-center justify-center space-x-2">
              {rankingBy === 'ranking' ? (
                <>
                  <MdOutlineLocalLibrary className="w-6 h-6 text-academic-indigo" />
                  <b className="text-academic-indigo">{formatRankingVariable(rankingBy)}</b>
                </>
              ) : rankingBy === 'studentCount' ? (
                <>
                  <MdInsights className="w-6 h-6 text-academic-orange" />
                  <b className="text-academic-orange">{formatRankingVariable(rankingBy)}</b>
                </>
              ) : (
                <b>{formatRankingVariable(rankingBy)}</b>
              )}
            </span>
          </p>
          <link href="/src/style.css" rel="stylesheet"></link>
        </header>

        <main className="space-y-8">
          <div className="md:col-span-1">
            <Scoreboard
              score={score}
              maxPossibleScore={maxPossibleScore}
              isSubmitted={isSubmitted}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center justify-between">
              <div className="flex items-center">
                <MdOutlineLocalLibrary className="w-7 h-7 mr-2 text-academic-indigo" />
                Your Ranking
              </div>

              <button
                onClick={() => setShowPopup(true)}
                title="View your stats"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              >
                <MdInsights className="w-6 h-6" />
              </button>
            </h2>
            <div
              className="space-y-4 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-100"
              aria-live="polite"
            >
              {universities.map((uni, index) => {
                const correctIndex = correctOrder.findIndex(
                  (correctUni) => correctUni.id === uni.id
                );
                const correctRank =
                  correctIndex !== -1 ? correctIndex + 1 : undefined;
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

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl w-11/12 max-w-md animate-fadeIn">
            {alreadyPlayed || isSubmitted ? (
              <>
                <h2 className="text-3xl font-bold text-indigo-700 mb-3">
                  You’ve completed today’s challenge!
                </h2>
                <p className="text-gray-700 text-lg mb-2">
                  Your score: <b>{previousScore ?? score}</b>
                </p>
                <p className="text-gray-600 mb-4">
                  Average score today: <b>{avgScore ?? '...'}</b>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-indigo-700 mb-3">
                  You haven’t played today’s challenge yet!
                </h2>
                <p className="text-gray-600 mb-4">
                  Come back once you’ve completed the ranking to see your daily stats.
                </p>
              </>
            )}

            {userAvg !== null && totalGames !== 1 && (
              <p className="text-gray-700 text-md mb-4">
                Your all-time average score ({totalGames} games): <b>{userAvg}</b>
              </p>
            )}
            {userAvg !== null && totalGames === 1 && (
              <p className="text-gray-700 text-md mb-4">
                Your all-time average score ({totalGames} game): <b>{userAvg}</b>
              </p>
            )}

            <div className="bg-indigo-50 border border-indigo-200 px-6 py-3 rounded-xl shadow-md mb-6">
              <p className="text-gray-700 font-medium">Next challenge starts in:</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{countdown}</p>
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingList;
