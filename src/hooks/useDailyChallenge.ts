import { useEffect, useState } from 'react'
import type { University } from '../types/University'

interface DailyGameResponse {
  id: string
  dateKey: string
  rankingBy: 'RANKING' | 'STUDENT_COUNT'
  entries: {
    orderIndex: number
    university: University
  }[]
}

export const useDailyChallenge = () => {
  const [dailyUniversities, setDailyUniversities] = useState<University[]>([])
  const [correctOrder, setCorrectOrder] = useState<University[]>([])
  const [rankingBy, setRankingBy] = useState<'ranking' | 'studentCount'>('ranking')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await fetch('/api/generateDailyGame')
        const data: DailyGameResponse = await res.json()

        // Convert rankingBy enum
        const variable = data.rankingBy === 'STUDENT_COUNT' ? 'studentCount' : 'ranking'

        // Extract universities
        const unis = data.entries.map(e => e.university)

        // Determine correct order
        const sorted = [...unis].sort((a, b) =>
          variable === 'studentCount'
            ? b.studentCount - a.studentCount
            : a.ranking - b.ranking
        )

        setDailyUniversities(unis.sort(() => 0.5 - Math.random())) // shuffle display
        setCorrectOrder(sorted)
        setRankingBy(variable)
        console.log("DAILY GAME DATA:", data)
      } catch (err) {
        console.error('Failed to fetch daily challenge:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDaily()
  }, [])

  return { dailyUniversities, correctOrder, rankingBy, isLoading }
}
