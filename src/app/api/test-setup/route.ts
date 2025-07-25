import { NextResponse } from 'next/server'
import { testGoogleCloudSetup } from '@/lib/test-apis'

export async function GET() {
  try {
    const result = await testGoogleCloudSetup()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to test APIs' },
      { status: 500 }
    )
  }
}