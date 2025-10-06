import { useEffect, useState } from 'react'
import type { University } from '../types/University'

export const useDailyChallenge = () => {
  const [data, setData] = useState<{
    dailyUniversities: University[],
    correctOrder: University[],
    rankingBy: 'ranking' | 'studentCount'
  }>({ dailyUniversities: [], correctOrder: [], rankingBy: 'ranking' })

  useEffect(() => {
    fetch('/api/generateDailyGame')
      .then(res => res.json())
      .then((game: { entries: { university: University }[], rankingBy: string }) => {
        const unis = game.entries.map((e: { university: University }) => e.university)
        const correctOrder = [...unis].sort((a, b) =>
          game.rankingBy === 'STUDENT_COUNT' ? b.studentCount - a.studentCount : a.ranking - b.ranking
        )
        setData({
          dailyUniversities: unis.sort(() => 0.5 - Math.random()),
          correctOrder,
          rankingBy: game.rankingBy === 'STUDENT_COUNT' ? 'studentCount' : 'ranking'
        })
      })
  }, [])

  return data
}
