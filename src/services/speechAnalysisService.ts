import { SpeechClient } from '@google-cloud/speech'
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'
import { CloudStorageService } from './cloudStorageService'

export interface AnalysisResult {
  transcription: string
  confidence: number
  speakingPace: number
  fillerWordCount: number
  clarityScore: number
  sentimentScore: number
  pauseCount: number
  averagePause: number
  primaryInsight: string
  improvementTips: string[]
  strengths: string[]
  weaknesses: string[]
}

export class SpeechAnalysisService {
  private speechClient: SpeechClient
  private videoClient: VideoIntelligenceServiceClient
  private storageService: CloudStorageService

  constructor() {
    this.speechClient = new SpeechClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })
    
    this.videoClient = new VideoIntelligenceServiceClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })

    this.storageService = new CloudStorageService()
  }

  async analyzeAudio(audioBuffer: Buffer, fileType?: string, userId?: string): Promise<AnalysisResult> {
    try {
      console.log(`Analyzing ${fileType} file (${(audioBuffer.length / 1024 / 1024).toFixed(1)}MB)`)

      // Route to appropriate service based on file type
      if (fileType && this.isVideoFile(fileType)) {
        console.log('Using Video Intelligence API for video file')
        return await this.analyzeVideoFile(audioBuffer, fileType, userId || 'anonymous')
      } else {
        console.log('Using Speech-to-Text API for audio file')
        return await this.analyzeSpeechFromAudio(audioBuffer, fileType, userId || 'anonymous')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      throw new Error(`Failed to analyze ${fileType || 'file'}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async analyzeVideoFile(videoBuffer: Buffer, fileType: string, userId: string): Promise<AnalysisResult> {
    let uploadedFile: { uri: string; fileName: string } | null = null

    try {
      console.log('Starting Video Intelligence API analysis...')

      // Always upload to Cloud Storage for video files
      console.log('Uploading video to Cloud Storage...')
      uploadedFile = await this.storageService.uploadFile(videoBuffer, fileType, userId)

      // Use Video Intelligence API with Cloud Storage URI
      console.log(`Analyzing video from Cloud Storage: ${uploadedFile.uri}`)
      const [operation] = await this.videoClient.annotateVideo({
        inputUri: uploadedFile.uri,
        features: ['SPEECH_TRANSCRIPTION'],
        videoContext: {
          speechTranscriptionConfig: {
            languageCode: 'en-US',
            enableWordTimeOffsets: true,
            enableAutomaticPunctuation: true,
            enableSpeakerDiarization: false,
            maxAlternatives: 1,
            filterProfanity: false,
          },
        },
      })

      console.log('Video analysis operation started:', operation.name)
      console.log('Waiting for completion... This may take a few minutes.')

      // Wait for the operation to complete with timeout
      const [result] = await Promise.race([
        operation.promise(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Video analysis timeout after 10 minutes')), 10 * 60 * 1000)
        )
      ]) as [any]

      console.log('Video analysis completed successfully')

      if (!result.annotationResults || result.annotationResults.length === 0) {
        throw new Error('No analysis results returned from Video Intelligence API')
      }

      const annotations = result.annotationResults[0]
      if (!annotations.speechTranscriptions || annotations.speechTranscriptions.length === 0) {
        throw new Error('No speech detected in the video. Please ensure the video contains clear speech.')
      }

      console.log(`Found ${annotations.speechTranscriptions.length} speech segments`)

      // Process the video transcription results
      const analysisResult = this.processVideoTranscriptionResults(annotations.speechTranscriptions)

      // Clean up the uploaded file
      if (uploadedFile) {
        this.storageService.deleteFile(uploadedFile.fileName).catch(console.error)
      }

      return analysisResult

    } catch (error) {
      console.error('Video Intelligence API error:', error)

      // Clean up uploaded file on error
      if (uploadedFile) {
        this.storageService.deleteFile(uploadedFile.fileName).catch(console.error)
      }

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Video analysis quota exceeded. Please try again later or contact support.')
        }
        if (error.message.includes('authentication') || error.message.includes('UNAUTHENTICATED')) {
          throw new Error('Video analysis authentication failed. Please check API credentials.')
        }
        if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Video analysis permission denied. Please check API permissions.')
        }
        if (error.message.includes('timeout')) {
          throw new Error('Video analysis is taking too long. Please try with a shorter video or contact support.')
        }
      }

      throw error
    }
  }

  private async analyzeSpeechFromAudio(audioBuffer: Buffer, fileType?: string, userId?: string): Promise<AnalysisResult> {
    let uploadedFile: { uri: string; fileName: string } | null = null

    try {
      const encoding = this.getAudioEncoding(fileType)
      console.log(`Using encoding: ${encoding} for file type: ${fileType}`)

      // For files larger than 10MB, use Cloud Storage
      if (audioBuffer.length > 10 * 1024 * 1024) {
        console.log('File size > 10MB, uploading to Cloud Storage...')
        uploadedFile = await this.storageService.uploadFile(audioBuffer, fileType || 'audio/wav', userId || 'anonymous')

        // Use long-running recognize for large files
        const [operation] = await this.speechClient.longRunningRecognize({
          config: {
            encoding: encoding as any,
            sampleRateHertz: this.getSampleRate(fileType),
            languageCode: 'en-US',
            enableWordTimeOffsets: true,
            enableAutomaticPunctuation: true,
            enableSpeakerDiarization: false,
            maxAlternatives: 1,
            profanityFilter: false,
          },
          audio: { uri: uploadedFile.uri }
        })

        console.log('Long-running speech recognition started, waiting for completion...')
        const [response] = await operation.promise()

        // Clean up uploaded file
        this.storageService.deleteFile(uploadedFile.fileName).catch(console.error)

        if (!response.results || response.results.length === 0) {
          throw new Error('No speech detected in the audio file.')
        }

        return this.processAnalysisResults(response)
      }

      // For smaller files, use direct recognition
      const [response] = await this.speechClient.recognize({
        config: {
          encoding: encoding as any,
          sampleRateHertz: this.getSampleRate(fileType),
          languageCode: 'en-US',
          enableWordTimeOffsets: true,
          enableAutomaticPunctuation: true,
          enableSpeakerDiarization: false,
          maxAlternatives: 1,
          profanityFilter: false,
        },
        audio: { content: audioBuffer.toString('base64') }
      })

      if (!response.results || response.results.length === 0) {
        throw new Error('No speech detected in the audio file.')
      }

      return this.processAnalysisResults(response)

    } catch (error) {
      console.error('Speech-to-Text API error:', error)

      // Clean up uploaded file on error
      if (uploadedFile) {
        this.storageService.deleteFile(uploadedFile.fileName).catch(console.error)
      }

      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          throw new Error('Speech analysis quota exceeded. Please try again later.')
        }
        if (error.message.includes('INVALID_ARGUMENT')) {
          throw new Error('Invalid audio format. Please try a different audio file or format.')
        }
      }

      throw error
    }
  }

  private processVideoTranscriptionResults(transcriptions: any[]): AnalysisResult {
    console.log('Processing video transcription results...')

    let fullTranscription = ''
    let totalConfidence = 0
    let confidenceCount = 0
    const allWords: any[] = []

    transcriptions.forEach((transcription, index) => {
      if (transcription.alternatives && transcription.alternatives.length > 0) {
        const alternative = transcription.alternatives[0]
    
        if (alternative.transcript) {
          fullTranscription += alternative.transcript + ' '
        }

        if (alternative.confidence !== undefined) {
          totalConfidence += alternative.confidence
          confidenceCount++
        }

        if (alternative.words) {
          allWords.push(...alternative.words)
        }

        console.log(`Segment ${index + 1}: "${alternative.transcript}" (confidence: ${alternative.confidence})`)
      }
    })

    fullTranscription = fullTranscription.trim()

    if (!fullTranscription) {
      throw new Error('No speech content detected in the video')
    }

    console.log(`Total words detected: ${allWords.length}`)

    const confidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0.75
    const speakingPace = this.calculateSpeakingPace(allWords)
    const fillerWordCount = this.countFillerWords(fullTranscription)
    const clarityScore = this.calculateClarityScore(confidence, fullTranscription)
    const sentimentScore = this.analyzeSentiment(fullTranscription)
    const { pauseCount, averagePause } = this.analyzePauses(allWords)

    const insights = this.generateInsights({
      confidence,
      speakingPace,
      fillerWordCount,
      clarityScore,
      pauseCount,
      transcription: fullTranscription
    })

    return {
      transcription: fullTranscription,
      confidence,
      speakingPace,
      fillerWordCount,
      clarityScore,
      sentimentScore,
      pauseCount,
      averagePause,
      ...insights
    }
  }

  private isVideoFile(fileType: string): boolean {
    const videoTypes = [
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/avi',
      'video/quicktime',
      'video/x-msvideo'
    ]
    return videoTypes.includes(fileType.toLowerCase()) || fileType.startsWith('video/')
  }

  private getAudioEncoding(fileType?: string): string {
    if (!fileType) return 'ENCODING_UNSPECIFIED'

    const encodingMap: Record<string, string> = {
      'audio/wav': 'LINEAR16',
      'audio/mp3': 'MP3',
      'audio/mpeg': 'MP3',
      'audio/m4a': 'MP3',
      'audio/aac': 'MP3',
      'audio/webm': 'WEBM_OPUS',
      'audio/ogg': 'OGG_OPUS'
    }

    return encodingMap[fileType.toLowerCase()] || 'ENCODING_UNSPECIFIED'
  }

  private getSampleRate(fileType?: string): number {
    if (fileType?.includes('wav')) return 44100
    if (fileType?.includes('webm')) return 48000
    return 16000
  }

  private processAnalysisResults(response: any): AnalysisResult {
    const results = response.results
    const alternatives = results.map((r: any) => r.alternatives[0])

    const transcription = alternatives.map((alt: any) => alt.transcript).join(' ')
    const confidence = alternatives.reduce((sum: number, alt: any) => sum + (alt.confidence || 0), 0) / alternatives.length
    const words = alternatives.flatMap((alt: any) => alt.words || [])
    const speakingPace = this.calculateSpeakingPace(words)
    const fillerWordCount = this.countFillerWords(transcription)
    const clarityScore = this.calculateClarityScore(confidence, transcription)
    const sentimentScore = this.analyzeSentiment(transcription)
    const { pauseCount, averagePause } = this.analyzePauses(words)

    const insights = this.generateInsights({
      confidence,
      speakingPace,
      fillerWordCount,
      clarityScore,
      pauseCount,
      transcription
    })

    return {
      transcription,
      confidence,
      speakingPace,
      fillerWordCount,
      clarityScore,
      sentimentScore,
      pauseCount,
      averagePause,
      ...insights
    }
  }

  private calculateSpeakingPace(words: any[]): number {
    if (words.length < 2) return 150

    const firstWord = words[0]
    const lastWord = words[words.length - 1]

    if (!firstWord?.startTime || !lastWord?.endTime) return 150

    const startSeconds = parseFloat(firstWord.startTime.seconds || 0) +
                        parseFloat(firstWord.startTime.nanos || 0) / 1e9
    const endSeconds = parseFloat(lastWord.endTime.seconds || 0) +
                      parseFloat(lastWord.endTime.nanos || 0) / 1e9

    const durationMinutes = (endSeconds - startSeconds) / 60
    if (durationMinutes <= 0) return 150

    return Math.round(words.length / durationMinutes)
  }

  private countFillerWords(transcription: string): number {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally']

    return fillerWords.reduce((count, filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi')
      const matches = transcription.match(regex)
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  private calculateClarityScore(confidence: number, transcription: string): number {
    let clarityScore = confidence
    const words = transcription.split(/\s+/)
    if (words.length === 0) return 0

    const shortWords = words.filter(word => word.length <= 2).length
    const shortWordRatio = shortWords / words.length

    if (shortWordRatio > 0.3) {
      clarityScore *= 0.9
    }

    return Math.min(1, Math.max(0, clarityScore))
  }

  private analyzeSentiment(transcription: string): number {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'enjoy']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'stupid', 'annoying']

    const words = transcription.toLowerCase().split(/\s+/)
    const positiveCount = positiveWords.filter(word => words.includes(word)).length
    const negativeCount = negativeWords.filter(word => words.includes(word)).length

    return Math.max(0, Math.min(1, 0.5 + (positiveCount - negativeCount) * 0.1))
  }

  private analyzePauses(words: any[]): { pauseCount: number; averagePause: number } {
    if (words.length < 2) return { pauseCount: 0, averagePause: 0 }

    const pauses: number[] = []

    for (let i = 1; i < words.length; i++) {
      const prevEnd = parseFloat(words[i-1].endTime?.seconds || 0) +
                     parseFloat(words[i-1].endTime?.nanos || 0) / 1e9
      const currentStart = parseFloat(words[i].startTime?.seconds || 0) +
                          parseFloat(words[i].startTime?.nanos || 0) / 1e9

      const pause = currentStart - prevEnd
      if (pause > 0.5) {
        pauses.push(pause)
      }
    }

    return {
      pauseCount: pauses.length,
      averagePause: pauses.length > 0 ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0
    }
  }

  private generateInsights(data: any): {
    primaryInsight: string
    improvementTips: string[]
    strengths: string[]
    weaknesses: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const tips: string[] = []

    if (data.confidence > 0.9) {
      strengths.push("Excellent speech clarity")
    } else if (data.confidence < 0.7) {
      weaknesses.push("Speech clarity could be improved")
      tips.push("Try speaking more slowly and enunciating clearly")
    }

    if (data.speakingPace >= 140 && data.speakingPace <= 160) {
      strengths.push("Perfect speaking pace")
    } else if (data.speakingPace > 180) {
      weaknesses.push("Speaking too quickly")
      tips.push("Slow down your pace - aim for 140-160 words per minute")
    } else if (data.speakingPace < 120) {
      weaknesses.push("Speaking pace is quite slow")
      tips.push("Try to increase your speaking pace slightly")
    }

    const avgWordsPerMinute = data.speakingPace || 150
    const estimatedDuration = data.transcription.split(' ').length / avgWordsPerMinute
    const fillersPerMinute = estimatedDuration > 0 ? data.fillerWordCount / estimatedDuration : 0

    if (fillersPerMinute < 2) {
      strengths.push("Great control of filler words")
    } else if (fillersPerMinute > 5) {
      weaknesses.push("Too many filler words")
      tips.push("Practice pausing instead of using filler words like 'um' and 'uh'")
    }

    let primaryInsight = "Keep up the great work!"
    if (strengths.length > weaknesses.length) {
      primaryInsight = `Your ${strengths[0].toLowerCase()} really shines through!`
    } else if (weaknesses.length > 0) {
      primaryInsight = `Focus on ${weaknesses[0].toLowerCase()} for your next session`
    }

    return {
      primaryInsight,
      improvementTips: tips,
      strengths,
      weaknesses
    }
  }
}
