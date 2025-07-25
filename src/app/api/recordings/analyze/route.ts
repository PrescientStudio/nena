import { NextRequest, NextResponse } from 'next/server'
import { IntegrationService } from '@/services'

const integrationService = new IntegrationService()
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const audioFile = formData.get('audio') as File
    const userId = formData.get('userId') as string
    const duration = parseInt(formData.get('duration') as string) || 0
    const videoUrl = formData.get('videoUrl') as string | undefined

    if (!audioFile || !userId) {
      return NextResponse.json(
        { success: false, error: 'Audio file and user ID are required' },
        { status: 400 }
      )
    }

    // Check file size
    if (audioFile.size > MAX_FILE_SIZE) {
    return NextResponse.json(
        {
          success: false,
          error: `File size (${(audioFile.size / 1024 / 1024).toFixed(1)}MB) exceeds the 500MB limit`
        },
        { status: 413 }
    )
  }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/aac', 'audio/ogg',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime', 'video/x-msvideo'
    ]

    const isValidType = allowedTypes.includes(audioFile.type) ||
                       audioFile.type.startsWith('audio/') ||
                       audioFile.type.startsWith('video/')

    if (!isValidType) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an audio or video file.' },
        { status: 400 }
      )
}

    console.log(`Processing uploaded file: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(1)}MB, ${audioFile.type})`)

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process the recording with file type
    const result = await integrationService.processRecording({
      userId,
      audioBuffer: buffer,
      duration: duration || Math.floor(arrayBuffer.byteLength / 16000),
      videoUrl,
      fileType: audioFile.type // Pass the file type
    })

    return NextResponse.json({
      success: true,
      recording: result.recording,
      analysisResult: result.analysisResult,
      newBadges: result.newBadges
    })

  } catch (error) {
    console.error('Recording analysis error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { success: false, error: 'Analysis quota exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      if (error.message.includes('size') || error.message.includes('large')) {
    return NextResponse.json(
          { success: false, error: 'File too large. Please upload a file smaller than 500MB.' },
          { status: 413 }
    )
  }
      if (error.message.includes('speech') || error.message.includes('No speech detected')) {
        return NextResponse.json(
          { success: false, error: 'No clear speech detected. Please ensure your recording contains clear speech.' },
          { status: 400 }
        )
}
    }

    return NextResponse.json(
      { success: false, error: 'Failed to analyze recording. Please try again or contact support.' },
      { status: 500 }
    )
  }
}

// Set the max body size for the API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
}

