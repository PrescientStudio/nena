import { PrismaClient } from '@prisma/client'  // Changed from '@/generated/prisma'
import type { AnalysisResult } from './speechAnalysisService'

const prisma = new PrismaClient()

export interface SaveRecordingData {
  userId: string
  audioBuffer: Buffer
  duration: number
  videoUrl?: string
  analysisResult: AnalysisResult
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

export class UserAnalyticsService {
  async saveRecording(data: SaveRecordingData) {
    const { userId, duration, videoUrl, analysisResult } = data
    
    // Save the recording
    const recording = await prisma.userRecording.create({
      data: {
        userId,
        duration,
        audioUrl: `recordings/${userId}/${Date.now()}.webm`, // You'd implement file upload
        videoUrl,
        transcription: analysisResult.transcription,
        confidence: analysisResult.confidence,
        speakingPace: analysisResult.speakingPace,
        clarityScore: analysisResult.clarityScore,
        sentimentScore: analysisResult.sentimentScore,
        fillerWordCount: analysisResult.fillerWordCount,
        pauseCount: analysisResult.pauseCount,
        averagePause: analysisResult.averagePause,
        primaryInsight: analysisResult.primaryInsight,
        improvementTips: analysisResult.improvementTips,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses
      }
    })

    // Update user analytics
    await this.updateUserAnalytics(userId, {
      duration,
      confidence: analysisResult.confidence,
      pace: analysisResult.speakingPace,
      clarity: analysisResult.clarityScore,
      fillers: analysisResult.fillerWordCount / (duration / 60) // per minute
    })

    return recording
  }

  async updateUserAnalytics(userId: string, sessionData: {
    duration: number
    confidence: number
    pace: number
    clarity: number
    fillers: number
  }) {
    const { duration, confidence, pace, clarity, fillers } = sessionData
    
    // Get existing analytics or create new
    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    })

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: {
          userId,
          totalRecordings: 1,
          totalPracticeTime: duration,
          averageConfidence: confidence,
          averagePace: pace,
          averageClarity: clarity,
          averageFillers: fillers,
          currentStreak: 1,
          longestStreak: 1,
          lastPracticeDate: new Date()
        }
      })
    } else {
      // Calculate new averages
      const totalRecordings = analytics.totalRecordings + 1
      const newAvgConfidence = (analytics.averageConfidence * analytics.totalRecordings + confidence) / totalRecordings
      const newAvgPace = (analytics.averagePace * analytics.totalRecordings + pace) / totalRecordings
      const newAvgClarity = (analytics.averageClarity * analytics.totalRecordings + clarity) / totalRecordings
      const newAvgFillers = (analytics.averageFillers * analytics.totalRecordings + fillers) / totalRecordings

      // Calculate streak
      const today = new Date()
      const lastPractice = analytics.lastPracticeDate
      const isConsecutiveDay = lastPractice && 
        Math.abs(today.getTime() - lastPractice.getTime()) <= 48 * 60 * 60 * 1000 // within 48 hours

      const newStreak = isConsecutiveDay ? analytics.currentStreak + 1 : 1
      const newLongestStreak = Math.max(analytics.longestStreak, newStreak)

      // Calculate changes
      const confidenceChange = newAvgConfidence - analytics.averageConfidence
      const paceChange = newAvgPace - analytics.averagePace
      const clarityChange = newAvgClarity - analytics.averageClarity
      const fillerChange = newAvgFillers - analytics.averageFillers

      analytics = await prisma.userAnalytics.update({
        where: { userId },
        data: {
          totalRecordings,
          totalPracticeTime: analytics.totalPracticeTime + duration,
          averageConfidence: newAvgConfidence,
          averagePace: newAvgPace,
          averageClarity: newAvgClarity,
          averageFillers: newAvgFillers,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          confidenceChange,
          paceChange,
          clarityChange,
          fillerChange,
          lastPracticeDate: today
        }
      })
    }

    return analytics
  }

  async getUserAnalytics(userId: string): Promise<UserStats | null> {
    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    })

    if (!analytics) return null

    return {
      totalRecordings: analytics.totalRecordings,
      totalPracticeTime: analytics.totalPracticeTime,
      currentStreak: analytics.currentStreak,
      longestStreak: analytics.longestStreak,
      averageConfidence: analytics.averageConfidence,
      averagePace: analytics.averagePace,
      averageClarity: analytics.averageClarity,
      averageFillers: analytics.averageFillers,
      confidenceChange: analytics.confidenceChange,
      paceChange: analytics.paceChange,
      clarityChange: analytics.clarityChange,
      fillerChange: analytics.fillerChange
    }
  }

  async getRecentRecordings(userId: string, limit: number = 5): Promise<RecentRecording[]> {
    const recordings = await prisma.userRecording.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        duration: true,
        confidence: true,
        primaryInsight: true
      }
    })

    return recordings.map(recording => ({
      ...recording,
      score: Math.round(recording.confidence * 100)
    }))
  }

  async getProgressData(userId: string, months: number = 7): Promise<ProgressDataPoint[]> {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const recordings = await prisma.userRecording.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        confidence: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group by month and calculate average scores
    const monthlyData = new Map<string, { total: number; count: number; month: number; year: number }>()
    
    recordings.forEach(recording => {
      const date = new Date(recording.createdAt)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const existing = monthlyData.get(key) || { total: 0, count: 0, month: date.getMonth(), year: date.getFullYear() }
      
      existing.total += recording.confidence * 100
      existing.count += 1
      monthlyData.set(key, existing)
    })

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return Array.from(monthlyData.entries()).map(([key, data]) => ({
      name: monthNames[data.month],
      score: Math.round(data.total / data.count),
      month: data.month,
      year: data.year
    })).sort((a, b) => a.year - b.year || a.month - b.month)
  }
}