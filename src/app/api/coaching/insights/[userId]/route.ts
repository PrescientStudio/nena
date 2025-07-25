import { NextRequest, NextResponse } from 'next/server'
import { PersonalCoachService } from '@/services'

const coachService = new PersonalCoachService()

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    const insights = await coachService.generatePersonalizedFeedback(userId)
    
    return NextResponse.json({
      success: true,
      insights
    })
  } catch (error) {
    console.error('Coaching insights error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Regenerate insights
  return GET(request, { params })
}