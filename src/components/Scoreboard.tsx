import React from 'react';

interface ScoreboardProps {
    score: number | null;
    maxPossibleScore: number;
    isSubmitted: boolean;
    onSubmit: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score, maxPossibleScore, isSubmitted, onSubmit }) => {
    return (
        <div className="sticky top-8 space-y-6">
            
            <div className="bg-indigo-50 p-6 rounded-2xl shadow-xl border border-indigo-200">
                <h2 className="text-2xl font-bold text-indigo-700 mb-3">
                    Game Status
                </h2>
                
                {isSubmitted ? (
                    <div className="text-center">
                        <p className="text-lg text-gray-700 font-medium">Your Final Score:</p>
                        <p className="text-6xl font-extrabold text-green-600 my-2">
                            {score} / {maxPossibleScore}
                        </p>
                        <p className="text-sm text-gray-500">
                            Great job! See the colors next to the ranks for accuracy.
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
            
            {/* Submit Button */}
            <button
                onClick={onSubmit}
                disabled={isSubmitted}
                className={`
                    w-full py-4 rounded-xl text-xl font-bold transition-all duration-300 transform
                    ${isSubmitted 
                        ? 'bg-gray-400 cursor-not-allowed shadow-inner' 
                        : 'bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 hover:shadow-3xl active:scale-[0.99]'}
                `}
            >
                {isSubmitted ? 'Challenge Complete!' : 'Submit My Ranking'}
            </button>
        </div>
    );
};

export default Scoreboard;