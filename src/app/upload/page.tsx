"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { X, ArrowLeft, Upload, File, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import NenaLogo from "@/components/nena-logo"

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes

interface UploadState {
  status: 'idle' | 'uploading' | 'analyzing' | 'success' | 'error'
  progress: number
  error: string | null
  result: any | null
}

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    result: null
  })

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 500MB limit`
    }

    // Check file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload an audio file (MP3, WAV, M4A, AAC) or video file (MP4, WebM, MOV, AVI)'
    }

    return null
  }

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validation = validateFile(selectedFile)
    if (validation) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: validation,
        result: null
      })
      return
    }

    setFile(selectedFile)
    setUploadState({
      status: 'idle',
      progress: 0,
      error: null,
      result: null
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles[0])
    }
  }, [handleFileSelect])

  const uploadAndAnalyze = async () => {
    if (!file || !user) return

    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }))

    try {
      // Create form data
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('userId', user.uid)
      formData.append('duration', Math.floor(file.size / 1000).toString()) // Rough estimate
      
      // Upload with progress tracking
      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 50) // Upload is 50% of total
            setUploadState(prev => ({ ...prev, progress }))
          }
        })

        xhr.onload = async () => {
          if (xhr.status === 200) {
            setUploadState(prev => ({ 
              ...prev, 
              status: 'analyzing', 
              progress: 50 
            }))

            try {
              const result = JSON.parse(xhr.responseText)
              
              // Simulate analysis progress
              for (let i = 50; i <= 100; i += 10) {
                setUploadState(prev => ({ ...prev, progress: i }))
                await new Promise(resolve => setTimeout(resolve, 200))
              }

              setUploadState({
                status: 'success',
                progress: 100,
                error: null,
                result
              })
              
              resolve(result)
            } catch (error) {
              reject(new Error('Failed to parse response'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => {
          reject(new Error('Upload failed'))
        }

        xhr.open('POST', '/api/recordings/analyze')
        xhr.send(formData)
      })

    } catch (error) {
      console.error('Upload error:', error)
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        result: null
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      default:
        return <Upload className="w-6 h-6 text-blue-500" />
    }
  }

  const getStatusMessage = () => {
    switch (uploadState.status) {
      case 'uploading':
        return 'Uploading your recording...'
      case 'analyzing':
        return 'Analyzing your speech with AI...'
      case 'success':
        return 'Analysis complete! Check out your results.'
      case 'error':
        return uploadState.error || 'Something went wrong'
      default:
        return file ? 'Ready to analyze your recording' : 'Select or drop a file to get started'
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <NenaLogo className="h-8 w-auto" />
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hover:bg-white/10">
            <X className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Upload Your Recording
            </h1>
            <p className="text-slate-300 text-lg">
              Get instant AI feedback on any audio or video recording
            </p>
          </div>

          {/* Upload Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Upload Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drop Zone */}
              {!file && uploadState.status === 'idle' && (
                <div
                  className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />
                  <p className="text-lg mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-white/60 mb-4">
                    Supports audio (MP3, WAV, M4A, AAC) and video (MP4, WebM, MOV, AVI)
                  </p>
                  <p className="text-xs text-white/40">Maximum file size: 500MB</p>
                  <input
                    id="file-input"
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* File Info */}
              {file && (
                <div className="bg-white/5 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <File className="w-8 h-8 text-blue-400" />
                    <div className="flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-white/60">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                    {uploadState.status === 'idle' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null)
                          setUploadState({
                            status: 'idle',
                            progress: 0,
                            error: null,
                            result: null
                          })
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {(uploadState.status === 'uploading' || uploadState.status === 'analyzing') && (
                    <div className="space-y-2">
                      <Progress value={uploadState.progress} className="h-2" />
                      <p className="text-sm text-center text-white/80">
                        {uploadState.progress}% complete
                      </p>
                    </div>
                  )}

                  {/* Status Message */}
                  <div className="text-center">
                    <p className={`text-sm ${
                      uploadState.status === 'error' ? 'text-red-400' :
                      uploadState.status === 'success' ? 'text-green-400' :
                      'text-white/80'
                    }`}>
                      {getStatusMessage()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center">
                    {uploadState.status === 'idle' && (
                      <Button
                        onClick={uploadAndAnalyze}
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={!user}
                      >
                        Analyze Recording
                      </Button>
                    )}

                    {uploadState.status === 'success' && (
                      <div className="space-y-3 text-center">
                        <Button
                          onClick={() => router.push('/dashboard')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          View Results
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFile(null)
                            setUploadState({
                              status: 'idle',
                              progress: 0,
                              error: null,
                              result: null
                            })
                          }}
                        >
                          Upload Another
                        </Button>
                      </div>
                    )}

                    {uploadState.status === 'error' && (
                      <Button
                        onClick={() => setUploadState({
                          status: 'idle',
                          progress: 0,
                          error: null,
                          result: null
                        })}
                        variant="outline"
                      >
                        Try Again
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Results Preview */}
              {uploadState.result && uploadState.status === 'success' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-green-300">Analysis Complete!</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Confidence Score:</span>
                      <div className="font-bold text-green-300">
                        {Math.round(uploadState.result.analysisResult?.confidence * 100)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-white/60">Speaking Pace:</span>
                      <div className="font-bold text-green-300">
                        {uploadState.result.analysisResult?.speakingPace} WPM
                      </div>
                    </div>
                  </div>
                  {uploadState.result.newBadges?.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-yellow-300">🎉 New badges earned: </span>
                      <span className="font-medium">{uploadState.result.newBadges.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center text-sm text-white/60 space-y-2">
            <p>
              💡 <strong>Pro tip:</strong> For best results, speak clearly and avoid background noise
            </p>
            <p>
              🔒 Your recordings are processed securely and deleted after analysis
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}