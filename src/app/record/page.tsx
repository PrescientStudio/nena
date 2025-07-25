"use client"

import { useState, useEffect } from "react"
import { useAdvancedRecorder } from "@/hooks/use-advanced-recorder"
import EnvironmentCheckUI from "./environment-check-ui"
import RecordingUI from "./recording-ui"
import PostRecordingUI from "./post-recording-ui"
import NenaLogo from "@/components/nena-logo"
import { Button } from "@/components/ui/button"
import { X, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

type PageStatus = "checking" | "ready" | "recording" | "finished"

export default function AdvancedRecordPage() {
  const [pageStatus, setPageStatus] = useState<PageStatus>("checking")

  const {
    recorderState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    restart,
    toggleMode,
    requestPermissions
  } = useAdvancedRecorder()

  const { status, mediaURL, error, analysis } = recorderState

  useEffect(() => {
    if (status === "recording" || status === "paused") {
      setPageStatus("recording")
    } else if (status === "stopped" && mediaURL) {
      setPageStatus("finished")
    } else if (status === "idle" && analysis.permissions.audio) {
      // Only mark as ready if we have at least audio permission
      setPageStatus("ready")
    } else {
    setPageStatus("checking")
  }
  }, [status, mediaURL, analysis.permissions])

  const handleCheckComplete = () => {
    if (analysis.permissions.audio) {
      setPageStatus("ready")
    } else {
      // Request permissions if not already granted
      requestPermissions()
    }
  }

  const handleStartRecording = () => {
    console.log('🎬 User clicked start recording')
    if (!analysis.permissions.audio) {
      console.log('❌ No audio permission, requesting...')
      requestPermissions()
      return
    }
    startRecording()
  }

  const handleRestart = () => {
    restart()
    setPageStatus("checking")
  }

  const handleRetryPermissions = () => {
    requestPermissions()
  }

  const renderContent = () => {
    // Show error state if there's an error
    if (error) {
        return (
        <div className="w-full max-w-lg mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Permission Required</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleRetryPermissions}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                Try Again
            </Button>
              <p className="text-sm text-slate-400">
                💡 Make sure to click "Allow" when your browser asks for camera/microphone access
              </p>
        </div>
      </div>
    </div>
  )
}

    switch (pageStatus) {
      case "checking":
      case "ready":
        return (
          <EnvironmentCheckUI
            isReady={pageStatus === "ready"}
            onCheckComplete={handleCheckComplete}
            onStartRecording={handleStartRecording}
            recorderState={recorderState}
            controls={{ toggleMode, requestPermissions }}
          />
        )
      case "recording":
        return (
          <RecordingUI
            recorderState={recorderState}
            onStopRecording={stopRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            controls={{ toggleMode, requestPermissions }}
          />
        )
      case "finished":
        return (
          <PostRecordingUI
            mediaUrl={mediaURL!}
            mediaType={recorderState.mode}
            onAnalyze={() => console.log("Analyze clicked")}
            onRecordAgain={handleRestart}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/30 to-transparent">
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
            <span className="sr-only">Exit Recording</span>
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full h-full pt-20 md:pt-24">
        {renderContent()}
      </main>

      {/* Status Indicator */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
        <div>Status: <span className="capitalize font-semibold text-blue-300">{pageStatus}</span></div>
        {recorderState.status === 'acquiring_media' && (
          <div className="text-yellow-300 text-xs">Requesting permissions...</div>
        )}
        {error && (
          <div className="text-red-300 text-xs">Error: Check permissions</div>
        )}
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-xs max-w-xs">
          <div>Video: {analysis.permissions.video ? '✅' : '❌'}</div>
          <div>Audio: {analysis.permissions.audio ? '✅' : '❌'}</div>
          <div>Stream: {recorderState.stream ? '✅' : '❌'}</div>
          <div>Status: {recorderState.status}</div>
        </div>
      )}
    </div>
  )
}