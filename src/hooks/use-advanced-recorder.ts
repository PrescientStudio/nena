"use client"

import { useState, useRef, useEffect, useCallback } from "react"

// Types
export type RecorderStatus = "idle" | "acquiring_media" | "recording" | "paused" | "stopped"
export type RecordingMode = "audio" | "video"
export type LightingCondition = "Checking..." | "Good" | "Too Dark" | "Too Bright"
export type NoiseCondition = "Checking..." | "Quiet" | "Noisy"
export type AudioQuality = "Good" | "Clear" | "Muffled" | "Too Loud" | "Background Noise"

export interface RecorderState {
  status: RecorderStatus
  mode: RecordingMode
  mediaURL: string | null
  stream: MediaStream | null
  elapsedTime: number
  error: string | null
  settings: {
    isCameraOn: boolean
    isNoiseCancellationOn: boolean
    micSensitivity: number
  }
  analysis: {
    permissions: { video: boolean; audio: boolean }
    lighting: LightingCondition
    noise: NoiseCondition
    audioQuality: AudioQuality
    coachingTip: string
    audioData: Uint8Array | null
  }
}

export interface RecorderControls {
  toggleMode: (mode: RecordingMode) => void
  toggleCamera: (isOn: boolean) => void
  toggleNoiseCancellation: (isOn: boolean) => void
  setMicSensitivity: (level: number) => void
  requestPermissions: () => void
}

const INITIAL_STATE: RecorderState = {
  status: "idle",
  mode: "video",
  mediaURL: null,
  stream: null,
  elapsedTime: 0,
  error: null,
  settings: {
    isCameraOn: true,
    isNoiseCancellationOn: true,
    micSensitivity: 1,
  },
  analysis: {
    permissions: { video: false, audio: false },
    lighting: "Checking...",
    noise: "Checking...",
    audioQuality: "Good",
    coachingTip: "Ready when you are!",
    audioData: null,
  },
}

const COACHING_TIPS = [
  "Great pace!",
  "Remember to smile.",
  "Good eye contact.",
  "Speak clearly.",
  "Try to vary your tone.",
  "Avoid filler words like 'um' or 'ah'.",
]

export const useAdvancedRecorder = () => {
  const [recorderState, setRecorderState] = useState<RecorderState>(INITIAL_STATE)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // --- UTILITY & CLEANUP ---
  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current)

    if (recorderState.stream) {
      recorderState.stream.getTracks().forEach((track) => {
        track.stop()
        console.log(`Stopped ${track.kind} track`)
      })
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
    }

    timerIntervalRef.current = null
    analysisIntervalRef.current = null
    audioContextRef.current = null
    analyserRef.current = null
    gainNodeRef.current = null
  }, [recorderState.stream])

  // --- MEDIA ACQUISITION & ANALYSIS ---
  const requestPermissions = useCallback(async () => {
    console.log('🎥 Requesting media permissions...')
    cleanup()

      setRecorderState((prev) => ({
        ...prev,
      status: "acquiring_media",
      error: null,
        analysis: {
          ...prev.analysis,
        permissions: { video: false, audio: false }
      }
      }))

    try {
      // First, check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Safari.")
    }

      // Request permissions based on mode
      const constraints: MediaStreamConstraints = {
        audio: {
          noiseSuppression: recorderState.settings.isNoiseCancellationOn,
          echoCancellation: true,
          autoGainControl: true
        },
        video: recorderState.mode === "video" ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false,
      }

      console.log('📋 Requesting with constraints:', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('✅ Stream acquired:', stream.getTracks().map(t => `${t.kind}: ${t.label}`))

      // Set up audio analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      const gainNode = audioContext.createGain()
      gainNode.gain.value = recorderState.settings.micSensitivity

      source.connect(gainNode).connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      gainNodeRef.current = gainNode

      // Check what permissions we actually got
      const hasVideo = stream.getVideoTracks().length > 0
      const hasAudio = stream.getAudioTracks().length > 0

      console.log(`📊 Permissions granted - Video: ${hasVideo}, Audio: ${hasAudio}`)

      setRecorderState((prev) => ({
        ...prev,
        stream,
        status: "idle",
        error: null,
        analysis: {
          ...prev.analysis,
          permissions: { video: hasVideo, audio: hasAudio },
          lighting: hasVideo ? "Checking..." : "Good",
          noise: "Checking..."
        },
      }))

    } catch (err) {
      console.error('❌ Error acquiring media:', err)

      let errorMessage = "Could not access camera or microphone. "

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = "Camera and microphone access denied. Please click the camera icon in your browser's address bar and allow access, then refresh the page."
        } else if (err.name === 'NotFoundError') {
          errorMessage = "No camera or microphone found. Please make sure your devices are connected and try again."
        } else if (err.name === 'NotReadableError') {
          errorMessage = "Camera or microphone is being used by another application. Please close other apps and try again."
        } else {
          errorMessage += err.message
    }
      }

      setRecorderState((prev) => ({
        ...prev,
        status: "idle",
        error: errorMessage,
        stream: null,
        analysis: {
          ...prev.analysis,
          permissions: { video: false, audio: false },
    },
      }))
    }
  }, [cleanup, recorderState.mode, recorderState.settings.isNoiseCancellationOn, recorderState.settings.micSensitivity])

  // --- REAL-TIME ANALYSIS ---
  const startAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current)

    analysisIntervalRef.current = setInterval(() => {
      if (!analyserRef.current || !audioContextRef.current) return

      try {
        // Audio analysis
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length

        const noise: NoiseCondition = avgVolume > 20 ? "Noisy" : "Quiet"
        const audioQuality: AudioQuality = avgVolume > 100 ? "Too Loud" : avgVolume < 10 ? "Muffled" : "Clear"

        // Waveform data for visualization
        const timeDomainData = new Uint8Array(analyserRef.current.fftSize)
        analyserRef.current.getByteTimeDomainData(timeDomainData)

        // Simple lighting analysis (this is basic - in production you'd analyze video frames)
        let lighting: LightingCondition = "Good"
        if (recorderState.mode === "video" && recorderState.stream) {
          // For now, just set to "Good" - you could analyze canvas pixels for real implementation
          lighting = "Good"
        }

        setRecorderState((prev) => ({
          ...prev,
          analysis: {
            ...prev.analysis,
            noise,
            lighting,
            audioQuality,
            audioData: timeDomainData,
            coachingTip: prev.status === "recording"
              ? COACHING_TIPS[Math.floor(Math.random() * COACHING_TIPS.length)]
              : "Ready when you are!",
    },
        }))
      } catch (error) {
        console.error('Analysis error:', error)
  }
    }, 1000) // Update every second

    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current)
}
  }, [recorderState.mode, recorderState.stream])

  // --- RECORDING CONTROLS ---
  const startRecording = useCallback(() => {
    console.log('🎬 Starting recording...')

    if (!recorderState.stream) {
      console.error('❌ No stream available for recording')
      setRecorderState(prev => ({ ...prev, error: "No media stream available. Please allow camera/microphone access first." }))
      return
    }

    try {
      // Create MediaRecorder with the stream
      const mediaRecorder = new MediaRecorder(recorderState.stream, {
        mimeType: recorderState.mode === "video" ? "video/webm" : "audio/webm"
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log('🛑 Recording stopped, processing chunks...')
        const mediaBlob = new Blob(audioChunksRef.current, {
          type: recorderState.mode === "video" ? "video/webm" : "audio/webm",
        })
        const mediaUrl = URL.createObjectURL(mediaBlob)

        setRecorderState((prev) => ({
          ...prev,
          status: "stopped",
          mediaURL: mediaUrl,
          elapsedTime: 0
        }))

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setRecorderState(prev => ({ ...prev, error: "Recording failed. Please try again." }))
      }

      mediaRecorder.start(1000) // Collect data every second
      console.log('✅ MediaRecorder started')

      setRecorderState((prev) => ({ ...prev, status: "recording", error: null }))

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecorderState((prev) => ({ ...prev, elapsedTime: prev.elapsedTime + 1 }))
      }, 1000)

    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      setRecorderState(prev => ({ ...prev, error: "Failed to start recording. Your browser may not support this feature." }))
    }
  }, [recorderState.stream, recorderState.mode])

  const stopRecording = useCallback(() => {
    console.log('⏹️ Stopping recording...')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const pauseRecording = useCallback(() => {
    console.log('⏸️ Pausing recording...')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      setRecorderState((prev) => ({ ...prev, status: "paused" }))
    }
  }, [])

  const resumeRecording = useCallback(() => {
    console.log('▶️ Resuming recording...')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      timerIntervalRef.current = setInterval(() => {
        setRecorderState((prev) => ({ ...prev, elapsedTime: prev.elapsedTime + 1 }))
      }, 1000)
      setRecorderState((prev) => ({ ...prev, status: "recording" }))
    }
  }, [])

  const restart = useCallback(() => {
    console.log('🔄 Restarting recorder...')
    cleanup()
    setRecorderState(INITIAL_STATE)
    // Don't auto-request permissions on restart - let user trigger it
  }, [cleanup])

  // --- SETTINGS CONTROLS ---
  const toggleMode = useCallback((mode: RecordingMode) => {
    console.log(`🔄 Switching to ${mode} mode`)
    setRecorderState((prev) => ({ ...prev, mode }))
    // Re-request permissions with new mode
    setTimeout(() => requestPermissions(), 100)
  }, [requestPermissions])

  const toggleCamera = useCallback((isOn: boolean) => {
    console.log(`📹 Camera ${isOn ? 'on' : 'off'}`)
    recorderState.stream?.getVideoTracks().forEach((track) => (track.enabled = isOn))
    setRecorderState((prev) => ({
      ...prev,
      settings: { ...prev.settings, isCameraOn: isOn }
    }))
  }, [recorderState.stream])

  const toggleNoiseCancellation = useCallback((isOn: boolean) => {
    console.log(`🔇 Noise cancellation ${isOn ? 'enabled' : 'disabled'}`)
    setRecorderState((prev) => ({
      ...prev,
      settings: { ...prev.settings, isNoiseCancellationOn: isOn }
    }))
    // Re-request permissions to apply new audio constraints
    setTimeout(() => requestPermissions(), 100)
  }, [requestPermissions])

  const setMicSensitivity = useCallback((level: number) => {
    console.log(`🎤 Mic sensitivity: ${level}`)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = level
    }
    setRecorderState((prev) => ({
      ...prev,
      settings: { ...prev.settings, micSensitivity: level }
    }))
  }, [])

  // --- INITIALIZATION ---
  useEffect(() => {
    console.log('🚀 Initializing recorder...')
    // Don't auto-request permissions - wait for user interaction
    return () => {
      console.log('🧹 Cleaning up recorder...')
      cleanup()
    }
  }, [cleanup])

  // Start analysis when we have a stream
  useEffect(() => {
    if (recorderState.stream && recorderState.status === "idle") {
      startAnalysis()
    }
  }, [recorderState.stream, recorderState.status, startAnalysis])

  const controls: RecorderControls = {
    toggleMode,
    toggleCamera,
    toggleNoiseCancellation,
    setMicSensitivity,
    requestPermissions,
  }

  return {
    recorderState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    restart,
    requestPermissions,
    ...controls
}
}
