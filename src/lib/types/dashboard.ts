export interface DashboardData {
  analytics: UserStats | null
  recentRecordings: RecentRecording[]
  progressData: ProgressDataPoint[]
  badges: BadgeProgress[]
  coachingInsights: CoachingInsight
  practiceIdeas: PracticeIdea[]
}

export interface UserStats {
  totalRecordings: number
  totalPracticeTime: number
  currentStreak: number
  longestStreak: number
  averageConfidence: number
  averagePace: number
  averageClarity: number
  averageFillers: number
  confidenceChange: number
  paceChange: number
  clarityChange: number
  fillerChange: number
}

export interface RecentRecording {
  id: string
  createdAt: Date
  duration: number
  confidence: number
  primaryInsight: string
  score: number
}

export interface ProgressDataPoint {
  name: string
  score: number
  month: number
  year: number
}

// Re-export from services
export type { BadgeProgress, CoachingInsight, PracticeIdea } from '../services'