import { NextRequest, NextResponse } from 'next/server'
import { BadgeService } from '@/services'

const badgeService = new BadgeService()

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    const badges = await badgeService.getUserBadges(userId)
    
    return NextResponse.json({
      success: true,
      badges
    })
  } catch (error) {
    console.error('Badges error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}