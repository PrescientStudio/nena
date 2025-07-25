import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface BadgeProgress {
  badge: {
    id: string
    name: string
    description: string
    category: string
    iconName: string
  }
  isUnlocked: boolean
  progress: number // 0-100
  requirement: string
  unlockedAt?: Date
}

export interface BadgeCriteria {
  recordings?: number
  streak?: number
  averageConfidence?: number
  speakingPace?: { min: number; max: number }
  fillersPerMinute?: { max: number }
  totalMinutes?: number
  consistentDays?: number
  improvementRate?: number
  specificWeekday?: number // 0-6, Sunday-Saturday
  monthlyGoal?: number
}

export class BadgeService {
  async checkAndAwardBadges(userId: string): Promise<string[]> {
    const newBadges: string[] = []
    
    // Get user's current analytics and badges
    const [analytics, userBadges, allBadges] = await Promise.all([
      prisma.userAnalytics.findUnique({ where: { userId } }),
      prisma.userBadge.findMany({ 
        where: { userId },
        include: { badge: true }
      }),
      prisma.badge.findMany({ where: { isActive: true } })
    ])

    if (!analytics) return newBadges

    // Get unlocked badge IDs for quick lookup
    const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badgeId))

    // Check each badge
    for (const badge of allBadges) {
      if (unlockedBadgeIds.has(badge.id)) continue // Already unlocked

      const criteria: BadgeCriteria = JSON.parse(badge.criteria)
      const isEligible = await this.checkBadgeEligibility(userId, criteria, analytics)

      if (isEligible) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id
          }
        })
        newBadges.push(badge.name)
      }
    }

    return newBadges
  }

  async getUserBadges(userId: string): Promise<BadgeProgress[]> {
    const [userBadges, allBadges, analytics] = await Promise.all([
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true }
      }),
      prisma.badge.findMany({ where: { isActive: true } }),
      prisma.userAnalytics.findUnique({ where: { userId } })
    ])

    const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badgeId))
    const badgeProgresses: BadgeProgress[] = []

    for (const badge of allBadges) {
      const isUnlocked = unlockedBadgeIds.has(badge.id)
      const userBadge = userBadges.find(ub => ub.badgeId === badge.id)
      
      let progress = 0
      if (!isUnlocked && analytics) {
        progress = await this.calculateBadgeProgress(userId, JSON.parse(badge.criteria), analytics)
      }

      badgeProgresses.push({
        badge: {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          category: badge.category,
          iconName: badge.iconName
        },
        isUnlocked,
        progress: isUnlocked ? 100 : progress,
        requirement: this.formatBadgeRequirement(JSON.parse(badge.criteria)),
        unlockedAt: userBadge?.unlockedAt
      })
    }

    // Sort by category, then by unlocked status, then by progress
    return badgeProgresses.sort((a, b) => {
      if (a.badge.category !== b.badge.category) {
        return a.badge.category.localeCompare(b.badge.category)
      }
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1
      }
      return b.progress - a.progress
    })
  }

  async createCustomBadge(badgeData: {
    name: string
    description: string
    category: string
    iconName: string
    criteria: BadgeCriteria
  }) {
    return await prisma.badge.create({
      data: {
        ...badgeData,
        criteria: JSON.stringify(badgeData.criteria)
      }
    })
  }

  private async checkBadgeEligibility(
    userId: string, 
    criteria: BadgeCriteria,
    analytics: any
  ): Promise<boolean> {
    // Basic stats checks
    if (criteria.recordings && analytics.totalRecordings < criteria.recordings) {
      return false
    }

    if (criteria.streak && analytics.currentStreak < criteria.streak) {
      return false
    }

    if (criteria.averageConfidence && analytics.averageConfidence < criteria.averageConfidence) {
      return false
    }

    if (criteria.totalMinutes && analytics.totalPracticeTime < criteria.totalMinutes * 60) {
      return false
    }

    // Speaking pace check
    if (criteria.speakingPace) {
      const { min, max } = criteria.speakingPace
      if (analytics.averagePace < min || analytics.averagePace > max) {
        return false
      }
    }

    // Filler words check
    if (criteria.fillersPerMinute) {
      if (analytics.averageFillers > criteria.fillersPerMinute.max) {
        return false
      }
    }

    // Improvement rate check
    if (criteria.improvementRate) {
      if (analytics.confidenceChange < criteria.improvementRate) {
        return false
      }
    }

    // Consistent days check (requires more complex query)
    if (criteria.consistentDays) {
      const isConsistent = await this.checkConsistentPractice(userId, criteria.consistentDays)
      if (!isConsistent) {
        return false
      }
    }

    // Specific weekday check
    if (criteria.specificWeekday !== undefined) {
      const hasWeekdayPractice = await this.checkWeekdayPractice(userId, criteria.specificWeekday)
      if (!hasWeekdayPractice) {
        return false
      }
    }

    // Monthly goal check
    if (criteria.monthlyGoal) {
      const hasMetMonthlyGoal = await this.checkMonthlyGoal(userId, criteria.monthlyGoal)
      if (!hasMetMonthlyGoal) {
        return false
      }
    }

    return true
  }

  private async calculateBadgeProgress(
    userId: string,
    criteria: BadgeCriteria,
    analytics: any
  ): Promise<number> {
    let totalChecks = 0
    let passedChecks = 0

    // Check each criterion and calculate percentage
    if (criteria.recordings) {
      totalChecks++
      const progress = Math.min(analytics.totalRecordings / criteria.recordings, 1)
      passedChecks += progress
    }

    if (criteria.streak) {
      totalChecks++
      const progress = Math.min(analytics.currentStreak / criteria.streak, 1)
      passedChecks += progress
    }

    if (criteria.averageConfidence) {
      totalChecks++
      const progress = Math.min(analytics.averageConfidence / criteria.averageConfidence, 1)
      passedChecks += progress
    }

    if (criteria.totalMinutes) {
      totalChecks++
      const currentMinutes = analytics.totalPracticeTime / 60
      const progress = Math.min(currentMinutes / criteria.totalMinutes, 1)
      passedChecks += progress
    }

    if (criteria.speakingPace) {
      totalChecks++
      const { min, max } = criteria.speakingPace
      const currentPace = analytics.averagePace
      
      if (currentPace >= min && currentPace <= max) {
        passedChecks += 1
      } else {
        // Calculate how close they are to the range
        const distanceToMin = Math.max(0, min - currentPace)
        const distanceToMax = Math.max(0, currentPace - max)
        const totalDistance = Math.max(distanceToMin, distanceToMax)
        const rangeSize = max - min
        const progress = Math.max(0, 1 - (totalDistance / rangeSize))
        passedChecks += progress
      }
    }

    if (criteria.fillersPerMinute) {
      totalChecks++
      const target = criteria.fillersPerMinute.max
      const current = analytics.averageFillers
      
      if (current <= target) {
        passedChecks += 1
      } else {
        // Progress based on how close they are to target
        const progress = Math.max(0, 1 - ((current - target) / target))
        passedChecks += progress
      }
    }

    if (criteria.improvementRate) {
      totalChecks++
      const progress = Math.min(Math.max(0, analytics.confidenceChange / criteria.improvementRate), 1)
      passedChecks += progress
    }

    return totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0
  }

  private async checkConsistentPractice(userId: string, requiredDays: number): Promise<boolean> {
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - requiredDays)

    const recordings = await prisma.userRecording.findMany({
      where: {
        userId,
        createdAt: {
          gte: daysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group recordings by date
    const practiceDates = new Set()
    recordings.forEach(recording => {
      const dateString = recording.createdAt.toISOString().split('T')[0]
      practiceDates.add(dateString)
    })

    return practiceDates.size >= requiredDays
  }

  private async checkWeekdayPractice(userId: string, weekday: number): Promise<boolean> {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const recordings = await prisma.userRecording.findMany({
      where: {
        userId,
        createdAt: {
          gte: oneMonthAgo
        }
      },
      select: {
        createdAt: true
      }
    })

    // Check if they have at least one recording on the specified weekday
    return recordings.some(recording => {
      return recording.createdAt.getDay() === weekday
    })
  }

  private async checkMonthlyGoal(userId: string, goalSessions: number): Promise<boolean> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyRecordings = await prisma.userRecording.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    return monthlyRecordings >= goalSessions
  }

  private formatBadgeRequirement(criteria: BadgeCriteria): string {
    const requirements: string[] = []

    if (criteria.recordings) {
      requirements.push(`Complete ${criteria.recordings} recording${criteria.recordings > 1 ? 's' : ''}`)
    }

    if (criteria.streak) {
      requirements.push(`Practice for ${criteria.streak} days in a row`)
    }

    if (criteria.averageConfidence) {
      requirements.push(`Achieve ${Math.round(criteria.averageConfidence * 100)}% average confidence`)
    }

    if (criteria.speakingPace) {
      requirements.push(`Speak at ${criteria.speakingPace.min}-${criteria.speakingPace.max} words per minute`)
    }

    if (criteria.fillersPerMinute) {
      requirements.push(`Reduce filler words to under ${criteria.fillersPerMinute.max} per minute`)
    }

    if (criteria.totalMinutes) {
      requirements.push(`Practice for ${criteria.totalMinutes} total minutes`)
    }

    if (criteria.consistentDays) {
      requirements.push(`Practice consistently for ${criteria.consistentDays} different days`)
    }

    if (criteria.improvementRate) {
      requirements.push(`Improve confidence by ${Math.round(criteria.improvementRate * 100)}%`)
    }

    if (criteria.specificWeekday !== undefined) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      requirements.push(`Practice on a ${days[criteria.specificWeekday]}`)
    }

    if (criteria.monthlyGoal) {
      requirements.push(`Complete ${criteria.monthlyGoal} sessions in a month`)
    }

    return requirements.join(' and ')
  }

  // Predefined badge creation methods
  async initializeDefaultBadges() {
    const defaultBadges = [
      // Milestone badges
      {
        name: "First Steps",
        description: "Complete your first recording session",
        category: "milestone",
        iconName: "award",
        criteria: { recordings: 1 }
      },
      {
        name: "Getting Started",
        description: "Complete 5 recording sessions",
        category: "milestone",
        iconName: "play",
        criteria: { recordings: 5 }
      },
      {
        name: "Practice Pro",
        description: "Complete 10 recording sessions",
        category: "milestone",
        iconName: "target",
        criteria: { recordings: 10 }
      },
      {
        name: "Speaking Veteran",
        description: "Complete 25 recording sessions",
        category: "milestone",
        iconName: "star",
        criteria: { recordings: 25 }
      },
      {
        name: "Speech Master",
        description: "Complete 50 recording sessions",
        category: "milestone",
        iconName: "crown",
        criteria: { recordings: 50 }
      },

      // Consistency badges
      {
        name: "Daily Dedication",
        description: "Practice for 3 days in a row",
        category: "consistency",
        iconName: "calendar",
        criteria: { streak: 3 }
      },
      {
        name: "Streak Master",
        description: "Practice for 7 days in a row",
        category: "consistency",
        iconName: "flame",
        criteria: { streak: 7 }
      },
      {
        name: "Unstoppable",
        description: "Practice for 14 days in a row",
        category: "consistency",
        iconName: "trending-up",
        criteria: { streak: 14 }
      },
      {
        name: "Marathon Speaker",
        description: "Practice for 30 days in a row",
        category: "consistency",
        iconName: "trophy",
        criteria: { streak: 30 }
      },

      // Improvement badges
      {
        name: "Confidence Builder",
        description: "Achieve 80% average confidence score",
        category: "improvement",
        iconName: "smile",
        criteria: { averageConfidence: 0.8 }
      },
      {
        name: "Confidence King",
        description: "Achieve 90% average confidence score",
        category: "improvement",
        iconName: "zap",
        criteria: { averageConfidence: 0.9 }
      },
      {
        name: "Perfect Pace",
        description: "Master optimal speaking pace (150-160 WPM)",
        category: "improvement",
        iconName: "gauge",
        criteria: { speakingPace: { min: 150, max: 160 } }
      },
      {
        name: "Clean Speaker",
        description: "Reduce filler words to under 2 per minute",
        category: "improvement",
        iconName: "sparkles",
        criteria: { fillersPerMinute: { max: 2 } }
      },
      {
        name: "Filler-Free",
        description: "Achieve under 1 filler word per minute",
        category: "improvement",
        iconName: "check-circle",
        criteria: { fillersPerMinute: { max: 1 } }
      },

      // Time-based badges
      {
        name: "Hour of Power",
        description: "Practice for 60 total minutes",
        category: "milestone",
        iconName: "clock",
        criteria: { totalMinutes: 60 }
      },
      {
        name: "Marathon Practitioner",
        description: "Practice for 300 total minutes (5 hours)",
        category: "milestone",
        iconName: "stopwatch",
        criteria: { totalMinutes: 300 }
      },

      // Special badges
      {
        name: "Weekend Warrior",
        description: "Practice on a weekend",
        category: "special",
        iconName: "sun",
        criteria: { specificWeekday: 0 } // Sunday
      },
      {
        name: "Monday Motivator",
        description: "Start your week with practice",
        category: "special",
        iconName: "coffee",
        criteria: { specificWeekday: 1 } // Monday
      },
      {
        name: "Monthly Champion",
        description: "Complete 12 sessions in a single month",
        category: "consistency",
        iconName: "calendar-check",
        criteria: { monthlyGoal: 12 }
      },
      {
        name: "Rapid Improver",
        description: "Improve confidence by 10% or more",
        category: "improvement",
        iconName: "arrow-up",
        criteria: { improvementRate: 0.1 }
      }
    ]

    for (const badge of defaultBadges) {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: {},
        create: {
          ...badge,
          criteria: JSON.stringify(badge.criteria)
        }
      })
    }
  }

  // Badge icon mapping for UI
  getBadgeIcon(iconName: string, isUnlocked: boolean = false) {
    const iconMap = {
      'award': '🏆',
      'play': '▶️',
      'target': '🎯',
      'star': '⭐',
      'crown': '👑',
      'calendar': '📅',
      'flame': '🔥',
      'trending-up': '📈',
      'trophy': '🏆',
      'smile': '😊',
      'zap': '⚡',
      'gauge': '⏱️',
      'sparkles': '✨',
      'check-circle': '✅',
      'clock': '🕐',
      'stopwatch': '⏰',
      'sun': '☀️',
      'coffee': '☕',
      'calendar-check': '📋',
      'arrow-up': '⬆️'
    }

    const icon = iconMap[iconName as keyof typeof iconMap] || '🎖️'
    return isUnlocked ? icon : '🔒'
  }
}