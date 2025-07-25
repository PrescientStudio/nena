import { NextRequest, NextResponse } from 'next/server'
import { PersonalCoachService } from '@/services'

const coachService = new PersonalCoachService()

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '3')
    
    const ideas = await coachService.generatePracticeIdeas(userId, count)
    
    return NextResponse.json({
      success: true,
      ideas
    })
  } catch (error) {
    console.error('Practice ideas error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate practice ideas' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Regenerate practice ideas
  return GET(request, { params })
}