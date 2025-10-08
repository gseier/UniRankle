import { useEffect, useState } from 'react'
import type { University } from '../types/University'

interface DailyGameResponse {
  id: string
  dateKey: string
  rankingBy: 'RANKING' | 'STUDENT_COUNT' | 'YEAR_FOUNDED' | 'CAMPUS_AREA'
  entries: {
    orderIndex: number
    university: University
  }[]
}

export const useDailyChallenge = () => {
  const [dailyUniversities, setDailyUniversities] = useState<University[]>([])
  const [correctOrder, setCorrectOrder] = useState<University[]>([])
  const [rankingBy, setRankingBy] = useState<'ranking' | 'studentCount' | 'yearFounded' | 'campusArea'>('ranking')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const localDateKey = new Date().toLocaleDateString('en-CA'); // e.g. 2025-10-08
        const res = await fetch(`/api/generateDailyGame?dateKey=${localDateKey}`);
        const data: DailyGameResponse = await res.json()

        // Convert rankingBy enum
        let variable: 'ranking' | 'studentCount' | 'yearFounded' | 'campusArea';
        switch (data.rankingBy) {
          case 'STUDENT_COUNT':
            variable = 'studentCount';
            break;
          case 'YEAR_FOUNDED':
            variable = 'yearFounded';
            break;
          case 'CAMPUS_AREA':
            variable = 'campusArea';
            break;
          default:
            variable = 'ranking';
        }

        // Extract universities
        const unis = data.entries.map(e => e.university)

        // Determine correct order
        const sorted = [...unis].sort((a, b) => {
          switch (variable) {
            case 'studentCount':
              return b.studentCount - a.studentCount;
            case 'yearFounded':
              return b.yearFounded - a.yearFounded;
            case 'campusArea':
              return b.campusArea - a.campusArea;
            default:
              return a.ranking - b.ranking;
          }
        })

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
