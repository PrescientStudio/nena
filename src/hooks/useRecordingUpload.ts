import { useState, useCallback } from 'react'

interface UploadResult {
  success: boolean
  recording?: any
  analysisResult?: any
  newBadges?: string[]
  error?: string
}

interface UseRecordingUploadReturn {
  uploading: boolean
  uploadProgress: number
  error: string | null
  uploadRecording: (audioBlob: Blob, userId: string, metadata?: any) => Promise<UploadResult>
  reset: () => void
}

function handleServiceError(error: any, context: string) {
  console.error(`${context} error:`, error)
  return {
    message: error instanceof Error ? error.message : `${context} failed`
  }
}

export function useRecordingUpload(): UseRecordingUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadRecording = useCallback(async (
    audioBlob: Blob, 
    userId: string, 
    metadata: any = {}
  ): Promise<UploadResult> => {
    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      console.log('Starting recording upload for user:', userId)

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('userId', userId)
      formData.append('duration', metadata.duration?.toString() || '0')
      
      if (metadata.videoUrl) {
        formData.append('videoUrl', metadata.videoUrl)
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/recordings/analyze', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed')
      }

      console.log('Recording uploaded and analyzed successfully')
      console.log('New badges:', result.newBadges)

      return {
        success: true,
        recording: result.recording,
        analysisResult: result.analysisResult,
        newBadges: result.newBadges
      }
    } catch (err) {
      const apiError = handleServiceError(err, 'Recording upload')
      setError(apiError.message)
      
      return {
        success: false,
        error: apiError.message
      }
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [])

  const reset = useCallback(() => {
    setUploading(false)
    setUploadProgress(0)
    setError(null)
  }, [])

  return {
    uploading,
    uploadProgress,
    error,
    uploadRecording,
    reset
  }
}