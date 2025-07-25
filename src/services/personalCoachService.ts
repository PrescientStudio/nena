import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface CoachingInsight {
  whatWorking: string
  improvementArea: string
  specificTip: string
  motivationalMessage: string
  customExercise: PracticeIdea
}

export interface PracticeIdea {
  id: string
  title: string
  description: string
  duration: number // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'confidence' | 'pace' | 'clarity' | 'storytelling' | 'presentation'
  instructions: string[]
  tips: string[]
}

export interface UserTrends {
  confidenceScores: number[]
  paceValues: number[]
  clarityScores: number[]
  fillerCounts: number[]
  commonWeaknesses: string[]
  recentStrengths: string[]
  practiceFrequency: number
  totalSessions: number
}

export class PersonalCoachService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async generatePersonalizedFeedback(userId: string): Promise<CoachingInsight> {
    // Get user's recent performance data
    const userTrends = await this.analyzeUserTrends(userId)
    
    if (userTrends.totalSessions === 0) {
      return this.getNewUserCoaching()
    }

    const prompt = this.buildCoachingPrompt(userTrends)
    
    try {
      const result = await this.model.generateContent(prompt)
      const responseText = result.response.text()
      
      return this.parseCoachingResponse(responseText, userTrends)
    } catch (error) {
      console.error('Gemini API error:', error)
      return this.getFallbackCoaching(userTrends)
    }
  }

  async generatePracticeIdeas(userId: string, count: number = 3): Promise<PracticeIdea[]> {
    const userTrends = await this.analyzeUserTrends(userId)
    
    const prompt = `
    Based on this user's speaking practice data:
    - Average confidence: ${(userTrends.confidenceScores.slice(-5).reduce((a, b) => a + b, 0) / 5 * 100).toFixed(1)}%
    - Common weaknesses: ${userTrends.commonWeaknesses.join(', ')}
    - Practice level: ${this.getUserLevel(userTrends.totalSessions)}
    - Sessions completed: ${userTrends.totalSessions}
    
    Generate ${count} personalized practice exercises in JSON format. Each should have:
    - title: Fun, engaging title
    - description: Brief description (1-2 sentences)
    - duration: Time in minutes (5-15)
    - difficulty: beginner/intermediate/advanced
    - category: confidence/pace/clarity/storytelling/presentation
    - instructions: Array of 3-5 step-by-step instructions
    - tips: Array of 2-3 helpful tips
    
    Make exercises specific to their weaknesses but keep them fun and achievable.
    Use encouraging language and creative scenarios.
    
    Return only valid JSON array.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const responseText = result.response.text()
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const exercises = JSON.parse(jsonMatch[0])
        return exercises.map((ex: any, index: number) => ({
          id: `exercise-${userId}-${Date.now()}-${index}`,
          ...ex
        }))
      }
    } catch (error) {
      console.error('Failed to generate practice ideas:', error)
    }

    // Fallback to default exercises
    return this.getDefaultPracticeIdeas(userTrends)
  }

  private async analyzeUserTrends(userId: string): Promise<UserTrends> {
    // Get last 10 recordings for trend analysis
    const recentRecordings = await prisma.userRecording.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        confidence: true,
        speakingPace: true,
        clarityScore: true,
        fillerWordCount: true,
        duration: true,
        weaknesses: true,
        strengths: true,
        createdAt: true,
      }
    })

    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    })

    // Calculate trends
    const confidenceScores = recentRecordings.map(r => r.confidence)
    const paceValues = recentRecordings.map(r => r.speakingPace)
    const clarityScores = recentRecordings.map(r => r.clarityScore)
    
    // Calculate fillers per minute for each recording
    const fillerCounts = recentRecordings.map(r => {
      const durationMinutes = r.duration / 60
      return r.fillerWordCount / durationMinutes
    })

    // Aggregate weaknesses and strengths
    const allWeaknesses = recentRecordings.flatMap(r => r.weaknesses)
    const allStrengths = recentRecordings.flatMap(r => r.strengths)
    
    const commonWeaknesses = this.getMostCommon(allWeaknesses, 3)
    const recentStrengths = this.getMostCommon(allStrengths, 3)

    // Calculate practice frequency (sessions per week)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentSessions = recentRecordings.filter(r => r.createdAt > oneWeekAgo)
    
    return {
      confidenceScores,
      paceValues,
      clarityScores,
      fillerCounts,
      commonWeaknesses,
      recentStrengths,
      practiceFrequency: recentSessions.length,
      totalSessions: analytics?.totalRecordings || 0
    }
  }

  private buildCoachingPrompt(trends: UserTrends): string {
    const avgConfidence = trends.confidenceScores.length > 0 
      ? (trends.confidenceScores.reduce((a, b) => a + b, 0) / trends.confidenceScores.length * 100).toFixed(1)
      : '0'
    
    const avgPace = trends.paceValues.length > 0
      ? Math.round(trends.paceValues.reduce((a, b) => a + b, 0) / trends.paceValues.length)
      : 0
    
    const avgFillers = trends.fillerCounts.length > 0
      ? (trends.fillerCounts.reduce((a, b) => a + b, 0) / trends.fillerCounts.length).toFixed(1)
      : '0'

    return `
    You are Nena, an encouraging and expert AI speaking coach. Analyze this user's progress:
    
    USER DATA:
    - Total practice sessions: ${trends.totalSessions}
    - Recent confidence average: ${avgConfidence}%
    - Speaking pace average: ${avgPace} WPM (optimal: 140-160)
    - Filler words per minute: ${avgFillers} (goal: under 2)
    - Practice frequency: ${trends.practiceFrequency} sessions this week
    - Common challenges: ${trends.commonWeaknesses.join(', ') || 'None identified'}
    - Recent strengths: ${trends.recentStrengths.join(', ') || 'Building foundation'}
    
    CONFIDENCE TREND: ${this.describeTrend(trends.confidenceScores)}
    PACE TREND: ${this.describeTrend(trends.paceValues)}
    
    Provide coaching feedback in this EXACT format:
    
    WHAT'S WORKING: [2-3 sentences about their strengths and positive progress]
    
    FOCUS AREA: [1-2 sentences about their biggest opportunity for improvement]
    
    SPECIFIC TIP: [1 actionable, specific technique they can try in their next session]
    
    MOTIVATION: [1-2 encouraging sentences that acknowledge their effort and progress]
    
    Keep the tone warm, encouraging, and professional. Be specific but not overwhelming.
    `
  }

  private parseCoachingResponse(response: string, trends: UserTrends): CoachingInsight {
    const sections = {
      whatWorking: this.extractSection(response, "WHAT'S WORKING:", "FOCUS AREA:"),
      improvementArea: this.extractSection(response, "FOCUS AREA:", "SPECIFIC TIP:"),
      specificTip: this.extractSection(response, "SPECIFIC TIP:", "MOTIVATION:"),
      motivationalMessage: this.extractSection(response, "MOTIVATION:", null)
    }

    // Generate a custom exercise based on their needs
    const customExercise = this.generateCustomExercise(trends)

    return {
      whatWorking: sections.whatWorking || "You're making great progress with your speaking practice!",
      improvementArea: sections.improvementArea || "Keep focusing on building your confidence.",
      specificTip: sections.specificTip || "Try recording yourself telling a 2-minute story about your day.",
      motivationalMessage: sections.motivationalMessage || "Every session makes you stronger. Keep it up!",
      customExercise
    }
  }

  private extractSection(text: string, startMarker: string, endMarker: string | null): string {
    const startIndex = text.indexOf(startMarker)
    if (startIndex === -1) return ""
    
    const contentStart = startIndex + startMarker.length
    const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length
    
    return text.substring(contentStart, endIndex === -1 ? text.length : endIndex).trim()
  }

  private generateCustomExercise(trends: UserTrends): PracticeIdea {
    const primaryWeakness = trends.commonWeaknesses[0]
    const level = this.getUserLevel(trends.totalSessions)
    
    // Base exercises for different weaknesses
    const exerciseTemplates = {
      'Speaking too quickly': {
        title: '🐌 Slow & Steady Story Time',
        category: 'pace' as const,
        instructions: [
          'Choose a childhood memory or favorite movie',
          'Set a timer for 3 minutes',
          'Tell the story, deliberately pausing between sentences',
          'Focus on speaking slower than feels natural',
          'Record and listen back for pace'
        ],
        tips: [
          'Imagine you\'re explaining to someone who doesn\'t speak your language well',
          'Use the "dot dot dot" method - pause where you see periods'
        ]
      },
      'Speech clarity could be improved': {
        title: '🎯 Crystal Clear Challenge',
        category: 'clarity' as const,
        instructions: [
          'Read a news article paragraph out loud',
          'Exaggerate your mouth movements',
          'Focus on pronouncing every consonant clearly',
          'Record yourself reading it',
          'Compare with normal speech'
        ],
        tips: [
          'Pretend you\'re speaking to someone across a noisy room',
          'Focus on moving your lips and tongue more than usual'
        ]
      },
      'Too many filler words': {
        title: '🚫 Filler-Free Challenge',
        category: 'confidence' as const,
        instructions: [
          'Choose a topic you know well',
          'Speak for 2 minutes about it',
          'When you want to say "um" or "uh", pause instead',
          'Count how many times you catch yourself',
          'Try again, aiming for fewer pauses'
        ],
        tips: [
          'Silence is better than filler words',
          'Practice the "power pause" - count to 2 before continuing'
        ]
      }
    }

    const template = exerciseTemplates[primaryWeakness as keyof typeof exerciseTemplates] 
      || exerciseTemplates['Speech clarity could be improved']

    return {
      id: `custom-${Date.now()}`,
      title: template.title,
      description: `A personalized exercise to help with ${primaryWeakness?.toLowerCase() || 'your speaking skills'}`,
      duration: level === 'beginner' ? 5 : level === 'intermediate' ? 7 : 10,
      difficulty: level,
      category: template.category,
      instructions: template.instructions,
      tips: template.tips
    }
  }

  private getUserLevel(totalSessions: number): 'beginner' | 'intermediate' | 'advanced' {
    if (totalSessions < 5) return 'beginner'
    if (totalSessions < 20) return 'intermediate'
    return 'advanced'
  }

  private getMostCommon(items: string[], limit: number): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item)
  }

  private describeTrend(values: number[]): string {
    if (values.length < 3) return 'Building baseline'
    
    const recent = values.slice(-3)
    const earlier = values.slice(0, -3)
    
    if (earlier.length === 0) return 'Starting strong'
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100
    
    if (change > 5) return 'Trending upward'
    if (change < -5) return 'Some recent challenges'
    return 'Staying consistent'
  }

  private getNewUserCoaching(): CoachingInsight {
    return {
      whatWorking: "Welcome to Nena! You're taking the first step toward becoming a more confident speaker, which is already amazing progress.",
      improvementArea: "Let's start with getting comfortable with recording yourself and hearing your own voice.",
      specificTip: "For your first recording, just introduce yourself and talk about something you love for 2 minutes. Don't worry about being perfect!",
      motivationalMessage: "Every expert was once a beginner. You've got this! 🌟",
      customExercise: {
        id: 'new-user-intro',
        title: '👋 Your First Speaking Adventure',
        description: 'A gentle introduction to get you started with confidence',
        duration: 3,
        difficulty: 'beginner',
        category: 'confidence',
        instructions: [
          'Find a quiet, comfortable space',
          'Introduce yourself to the camera/microphone',
          'Talk about your favorite hobby or interest',
          'Don\'t worry about mistakes - just be yourself!',
          'Celebrate completing your first recording!'
        ],
        tips: [
          'Smile while speaking - it comes through in your voice',
          'Remember: this is just for you to learn and grow'
        ]
      }
    }
  }

  private getFallbackCoaching(trends: UserTrends): CoachingInsight {
    return {
      whatWorking: "You're consistently working on your speaking skills, and that dedication is going to pay off!",
      improvementArea: "Keep focusing on the fundamentals - clarity, pace, and confidence all work together.",
      specificTip: "Try recording yourself reading something interesting out loud for 3 minutes, focusing on clear pronunciation.",
      motivationalMessage: "Progress isn't always linear, but it's always happening. Keep practicing!",
      customExercise: this.generateCustomExercise(trends)
    }
  }

  private getDefaultPracticeIdeas(trends: UserTrends): PracticeIdea[] {
    const level = this.getUserLevel(trends.totalSessions)
    
    const defaultExercises: PracticeIdea[] = [
      {
        id: 'storytelling-basics',
        title: '📚 Story Time Challenge',
        description: 'Practice storytelling with a simple, engaging narrative',
        duration: 5,
        difficulty: level,
        category: 'storytelling',
        instructions: [
          'Think of a funny or interesting thing that happened to you recently',
          'Structure it: setup, what happened, how it ended',
          'Tell it like you\'re talking to a friend',
          'Focus on being engaging rather than perfect'
        ],
        tips: [
          'Use your hands and facial expressions',
          'Vary your tone to keep it interesting'
        ]
      },
      {
        id: 'confidence-booster',
        title: '💪 Power Pose & Speak',
        description: 'Build confidence through body language and positive affirmations',
        duration: 3,
        difficulty: 'beginner',
        category: 'confidence',
        instructions: [
          'Stand in a power pose (hands on hips, chest out) for 30 seconds',
          'Look in the mirror and give yourself a compliment',
          'Record yourself sharing 3 things you\'re good at',
          'Speak with the same confident posture'
        ],
        tips: [
          'Your body language affects how you sound',
          'Confidence is a skill you can practice'
        ]
      },
      {
        id: 'pace-control',
        title: '🎵 Rhythm & Flow Practice',
        description: 'Master your speaking pace with rhythm exercises',
        duration: 7,
        difficulty: level,
        category: 'pace',
        instructions: [
          'Choose a topic you know well',
          'Speak about it for 1 minute at normal pace',
          'Repeat the same content speaking slower',
          'Then try it slightly faster but still clear',
          'Find your optimal pace'
        ],
        tips: [
          'Imagine you\'re a news anchor delivering important information',
          'Pace isn\'t just speed - it\'s about rhythm and pauses'
        ]
      }
    ]

    return defaultExercises
  }
}
