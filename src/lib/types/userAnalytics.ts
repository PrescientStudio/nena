export interface UserRecording {
  id: string
  userId: string
  createdAt: Date
  duration: number
  audioUrl: string
  videoUrl?: string
  analysisResult: AnalysisResult
  userFeedback?: string
  practiceType: 'freeform' | 'exercise' | 'presentation'
}

export interface UserProgress {
  userId: string
  totalRecordings: number
  totalPracticeTime: number
  averageConfidence: number
  currentStreak: number
  longestStreak: number
  badges: Badge[]
  achievements: Achievement[]
  monthlyProgress: MonthlyProgress[]
}

export interface Badge {
  id: string
  name: string
  description: string
  unlockedAt: Date
  category: 'consistency' | 'improvement' | 'milestone'
}