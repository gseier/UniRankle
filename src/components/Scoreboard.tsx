import React from 'react';

interface ScoreboardProps {
  score: number | null;
  maxPossibleScore: number;
  isSubmitted: boolean;
  onSubmit: () => void;
  averageScore?: number | null;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score, maxPossibleScore, isSubmitted, onSubmit, averageScore }) => {
  return (
    <div className="sticky top-8 space-y-6">
      <div className="bg-indigo-50 p-6 rounded-2xl shadow-xl border border-indigo-200">
        {isSubmitted ? (
          <div className="text-center">
            <p className="text-lg text-gray-700 font-medium">Your Final Score:</p>
            <p className="text-6xl font-extrabold text-green-600 my-2">
              {score} / {maxPossibleScore}
            </p>
            {averageScore !== null && (
              <p className="text-sm text-gray-600 mt-2">
                Today’s average: <b>{averageScore}</b> / {maxPossibleScore}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {score === 0 && "Are you even trying?"}
              {score === 1 && "Ouch! That was rough. Time to hit the books."}
              {score === 2 && "Not great, but at least it's not the worst."}
              {score === 3 && "Meh, you're halfway there. Keep trying."}
              {score === 4 && "Pretty good, but not perfect. Almost there!"}
              {score === 5 && "Outstanding! You nailed it!"}
              {score !== null && score > 5 && "Amazing! You've exceeded expectations!"}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-700">
            <p className="text-lg font-semibold">Ready to test your knowledge?</p>
            <p className="text-sm mt-1">
              Drag and drop the universities until you're satisfied with your list.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitted}
        className={`
          w-full py-4 rounded-xl text-xl font-bold transition-all duration-300 transform
          ${isSubmitted
            ? 'bg-gray-400 cursor-not-allowed shadow-inner'
            : 'bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 hover:shadow-3xl active:scale-[0.99]'
          }
        `}
      >
        {isSubmitted ? 'Challenge Complete!' : 'Submit My Ranking'}
      </button>
    </div>
  );
};

export default Scoreboard;
