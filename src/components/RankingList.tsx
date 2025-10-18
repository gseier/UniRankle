import React, { useState, useCallback, useEffect } from 'react';
import SortableItem from './SortableItem';
import SortableItemMobile from './SortableItemMobile';
import Scoreboard from './Scoreboard';
import { useDailyChallenge } from '../hooks/useDailyChallenge';
import { arrayMove, calculateScore, calculateMaxScore } from '../utils/dndUtils';
import type { University } from '../types/University';
import { MdOutlineLocalLibrary, MdInsights, MdOutlineFormatListNumberedRtl, MdPeopleOutline, MdOutlineMap, MdOutlineImportContacts } from 'react-icons/md';
import unirankleImage from '/images/unirankle.png';
import DailyScoreDistributionChart from './DailyScoreDistributionChart'; // Import chart
import UserScoreDistributionChart from './UserScoreDistributionChart'; // Import chart

const formatRankingVariable = (key: keyof University | 'studentCount') => {
  switch (key) {
    case 'ranking': return 'Global Rank';
    case 'studentCount': return 'Student Count';
    case 'yearFounded': return 'Year Founded';
    case 'campusArea': return 'Campus Area (sq km)';
    default: return 'Unknown Metric';
  }
};

const RankingList: React.FC = () => {
  const { dailyUniversities, correctOrder, rankingBy, isLoading } = useDailyChallenge();
  const [universities, setUniversities] = useState<University[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showCopyNotice, setShowCopyNotice] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCopyFadingOut, setIsCopyFadingOut] = useState(false);

  const closePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
    }, 300); // matches animation duration
  };

  const handleCopyResult = () => {
    if (score === null && previousScore === null) return;

    const finalScore = previousScore ?? score ?? 0;
    const total = 5;
    const emojiRow = Array.from({ length: total }, (_, i) =>
      i < finalScore ? '🟩' : '🟥'
    ).join('');

    const today = new Date().toLocaleDateString('en-CA');
    const text = `I got ${finalScore}/5 on today's UniRankle challenge!\n\n${emojiRow}\n\n${today}\nPlay here: https://www.unirankle.seier.me`;

    navigator.clipboard.writeText(text).then(() => {
      setShowCopyNotice(true);
      setTimeout(() => setIsCopyFadingOut(true), 1500); // start fade-out after 1.5s
      setTimeout(() => {
        setShowCopyNotice(false);
        setIsCopyFadingOut(false);
      }, 2000); // total of 2s visible
    });
  };




  const [userAvg, setUserAvg] = useState<number | null>(null);
  const [totalGames, setTotalGames] = useState<number>(0);
  
  // State for chart data
  interface DistributionData {
    name: string;
    count: number;
  }

  const [dailyDistribution, setDailyDistribution] = useState<DistributionData[] | null>(null);
  interface UserDistributionData {
    name: string;
    count: number;
  }
  const [userDistribution, setUserDistribution] = useState<UserDistributionData[] | null>(null);

  // Fetch user stats (including all-time distribution)
  useEffect(() => {
    const fetchUserStats = async () => {
      const res = await fetch('/api/userStats');
      const data = await res.json();
      if (res.ok) {
        setUserAvg(data.avgScore);
        setTotalGames(data.totalGames);
        // Only set distribution if there's data to show
        if (data.distribution && data.distribution.some((d: { score: number; count: number }) => d.count > 0)) {
          setUserDistribution(data.distribution);
        }
      }
    };
    fetchUserStats();
  }, []);

  // Load universities
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
      const localDateKey = new Date().toLocaleDateString('en-CA');
      const res = await fetch(`/api/checkPlayed?dateKey=${localDateKey}`);
      const data = await res.json();
      if (data.alreadyPlayed) {
        setAlreadyPlayed(true);
        setIsSubmitted(true);
        setPreviousScore(data.previousScore);
        const avgRes = await fetch(`/api/getScores?dateKey=${localDateKey}`);
        const avgData = await avgRes.json();
        setAvgScore(avgData.average);
        setDailyDistribution(avgData.distribution); // Get daily distribution
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

    localStorage.setItem('uniOrder', JSON.stringify(universities.map(u => u.id)));
    
    const localDateKey = new Date().toLocaleDateString('en-CA');
    fetch(`/api/saveScore?dateKey=${localDateKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: finalScore, dateKey: localDateKey }),
    })
      .then(res => res.json())
      .then(async (data) => {
        if (data.success || data.alreadyPlayed) {
          const avgRes = await fetch(`/api/getScores?dateKey=${localDateKey}`);
          const avgData = await avgRes.json();
          setAvgScore(avgData.average);
          setDailyDistribution(avgData.distribution); // Get daily distribution on submit
          setPreviousScore(data.previousScore ?? finalScore);

          const userRes = await fetch('/api/userStats');
          const userData = await userRes.json();
          setUserAvg(userData.avgScore);
          setTotalGames(userData.totalGames);
          setUserDistribution(userData.distribution);
        }
      })
      .catch(err => console.error('Failed to save score', err));
  }, [universities, correctOrder, isSubmitted, alreadyPlayed]);

  // Loading states
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
            <div className="flex justify-center items-center">
              <img
              src={unirankleImage}
              alt="UniRankle Logo"
              className="w-64 h-24 sm:w-80 sm:h-30 object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          
          <p className="text-gray-700 mt-4 max-w-xl mx-auto text-lg border-t pt-4">
            Today's challenge:
            <br />
            Rank these five universities from 1 (Highest) to 5 (Lowest) based on
            <br />
            <span className="flex items-center justify-center space-x-2">
              {rankingBy === 'ranking' ? (
                <>
                  <MdOutlineFormatListNumberedRtl className="w-6 h-6 text-academic-indigo" />
                  <b className="text-academic-indigo">{formatRankingVariable(rankingBy)}</b>
                </>
              ) : rankingBy === 'studentCount' ? (
                <>
                  <MdPeopleOutline className="w-6 h-6 text-academic-orange" />
                  <b className="text-academic-orange">{formatRankingVariable(rankingBy)}</b>
                </>
              ) : rankingBy === 'yearFounded' ? (
                <>
                  <MdOutlineImportContacts className="w-6 h-6 text-academic-orange" />
                  <b className="text-academic-orange">{formatRankingVariable(rankingBy)}</b>
                </>
              ) : rankingBy === 'campusArea' ? (
                <>
                  <MdOutlineMap className="w-6 h-6 text-academic-green" />
                  <b className="text-academic-green">{formatRankingVariable(rankingBy)}</b>
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
                const correctIndex = correctOrder.findIndex((u) => u.id === uni.id);
                const correctRank = correctIndex !== -1 ? correctIndex + 1 : undefined;
                return (
                    <div key={uni.id}>
                      {/* Mobile version */}
                      <div className="block sm:hidden">
                        <SortableItemMobile
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
                      </div>

                      {/* Desktop version */}
                      <div className="hidden sm:block">
                        <SortableItem
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
                      </div>
                    </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {showPopup && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 p-4 
            backdrop-blur-sm bg-black/40 transition-all duration-300 
            ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
        >
          <div
            className={`bg-white rounded-2xl p-6 text-center shadow-2xl w-full max-w-lg 
              overflow-y-auto max-h-[90vh] transition-all duration-300
              ${isClosing ? 'animate-fade-out-up' : 'animate-fade-in-up'}`}
          >
            {alreadyPlayed || isSubmitted ? (
              <>
                <h2 className="text-2xl font-bold text-indigo-700 mb-3">
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
                <h2 className="text-2xl font-bold text-indigo-700 mb-3">
                  You haven’t played today’s challenge yet!
                </h2>
                <p className="text-gray-600 mb-4">
                   Come back once you’ve completed the ranking to see your daily stats.
                </p>
              </>
            )}
            {isSubmitted && dailyDistribution && (
              <div className="mb-4">
                <DailyScoreDistributionChart data={dailyDistribution} userScore={previousScore ?? score} />
              </div>
            )}
            {userAvg !== null && totalGames > 0 && (
              <p className="text-gray-700 text-md mb-4">
                Your all-time average score ({totalGames} game{totalGames > 1 ? 's' : ''}): <b>{userAvg}</b>
              </p>
            )}
            
            {/* --- CHARTS --- */}
            {totalGames > 0 && userDistribution && (
              <p>
                <UserScoreDistributionChart data={userDistribution} />
              </p>
            )}
            {/* --- END CHARTS --- */}
            
            <div className="bg-indigo-50 border border-indigo-200 px-6 py-3 rounded-xl shadow-md mt-6 mb-4">
              <p className="text-gray-700 font-medium">Next challenge starts in:</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{countdown}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            {(alreadyPlayed || isSubmitted) && (
              <button
                onClick={handleCopyResult}
                className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition cursor-pointer"
              >
              Copy My Result
              </button>
            )}

            <button
              onClick={closePopup}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition cursor-pointer"
            >
              Close
            </button>
            </div>
          </div>
        </div>
      )}
      {showCopyNotice && (
  <div
    className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 
      bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg z-[9999]
      transition-opacity duration-500
      ${isCopyFadingOut ? 'animate-fade-out' : 'animate-fade-in-up'}`}
  >
    ✅ Result copied to clipboard!
  </div>
)}


    </div>
  );
};

export default RankingList;