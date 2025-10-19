import React, { useEffect, useState } from "react"
import { Trophy, Star } from "lucide-react"
import { motion } from "framer-motion"

interface ScoreboardProps {
  score: number | null
  maxPossibleScore: number
  isSubmitted: boolean
  onSubmit: () => void
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  score,
  maxPossibleScore,
  isSubmitted,
  onSubmit,
}) => {
  const [savedScore, setSavedScore] = useState<number | null>(score)

  useEffect(() => {
    if (isSubmitted && score !== null) {
      localStorage.setItem("lastScore", score.toString())
      setSavedScore(score)
    } else {
      const stored = localStorage.getItem("lastScore")
      if (stored) setSavedScore(parseInt(stored))
    }
  }, [isSubmitted, score])

  const finalScore = savedScore ?? score

  return (
    <div className="sticky top-8 space-y-6">
      <div className="bg-indigo-50 p-6 rounded-2xl shadow-xl border border-indigo-200">
        {isSubmitted ? (
          <div className="text-center">
            {/* Animated title and score section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-yellow-500 drop-shadow" />
                <h2 className="text-xl font-bold text-indigo-800 tracking-wide">
                  Your Final Score
                </h2>
                <Trophy className="h-6 w-6 text-yellow-500 drop-shadow" />
              </div>

              <div className="flex items-center gap-1 text-4xl font-extrabold text-yellow-500">
                {Array.from({ length: maxPossibleScore }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 transition-all ${
                      i < (finalScore ?? 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-foreground">
                  {finalScore} / {maxPossibleScore}
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-sm text-gray-600"
              >
                {finalScore === 0 && "Are you even trying?"}
                {finalScore === 1 && "Ouch! That was rough. Time to hit the books."}
                {finalScore === 2 && "Not great, but at least it's not the worst."}
                {finalScore === 3 && "Meh, you're halfway there. Keep trying."}
                {finalScore === 4 && "Pretty good, but not perfect. Almost there!"}
                {finalScore === 5 && "Outstanding! You nailed it!"}
                {finalScore !== null && finalScore > 5 && "Amazing! You've exceeded expectations!"}
              </motion.div>
            </motion.div>
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
          ${
            isSubmitted
              ? "bg-gray-400 cursor-not-allowed shadow-inner"
              : "bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 hover:shadow-3xl active:scale-[0.99] cursor-pointer"
          }
        `}
      >
        {isSubmitted ? "Challenge Complete!" : "Submit My Ranking"}
      </button>
    </div>
  )
}

export default Scoreboard
