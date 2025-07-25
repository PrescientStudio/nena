"use client"

import type { RecordingUIProps } from "@/hooks/use-advanced-recorder"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pause, Play, Square, Mic, Video, Camera, Volume2, Sparkles, Settings } from "lucide-react"
import LivePreview from "@/components/record/live-preview"
import WaveformVisualizer from "@/components/record/waveform-visualizer"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export default function RecordingUI({
  recorderState,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  controls,
}: RecordingUIProps) {
  const { status, elapsedTime, stream, mode, analysis, settings } = recorderState
  const { audioData, coachingTip, audioQuality } = analysis
  const { toggleCamera, toggleNoiseCancellation, setMicSensitivity } = controls
  const isRecording = status === "recording"
  const isPaused = status === "paused"

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 max-w-7xl mx-auto">
      {/* Main Recording Area */}
      <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 mb-8">
        {/* Video/Audio Preview */}
        <div className="w-full lg:w-2/3 h-full flex flex-col items-center justify-center relative">
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
            {mode === "video" ? (
              <LivePreview stream={stream} mode={mode} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative">
                  <Mic className="w-32 h-32 text-blue-400" />
                  <div className={`absolute inset-0 rounded-full ${isRecording ? "animate-ping bg-red-500/20" : ""}`} />
                </div>
                <p className="text-2xl mt-6 font-semibold">Audio Recording Mode</p>
                <p className="text-slate-500 mt-2">Your voice is being captured</p>
              </div>
            )}

            {/* Live Coaching Tip Overlay */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm p-3 rounded-lg text-sm max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="font-semibold text-yellow-300">Live Tip</span>
              </div>
              <p className="text-white">{coachingTip}</p>
            </div>

            {/* Audio Quality Indicator */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm p-2 rounded-lg text-sm flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  audioQuality === "Clear"
                    ? "bg-green-400"
                    : audioQuality === "Good"
                      ? "bg-blue-400"
                      : audioQuality === "Too Loud"
                        ? "bg-red-400"
                        : "bg-yellow-400"
                }`}
              />
              <span className="text-white">Audio: {audioQuality}</span>
            </div>

            {/* Recording Status Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm px-3 py-2 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-white font-semibold">RECORDING</span>
              </div>
            )}

            {isPaused && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-yellow-600/90 backdrop-blur-sm px-3 py-2 rounded-full">
                <Pause className="w-4 h-4 text-white" />
                <span className="text-white font-semibold">PAUSED</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-lg">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-blue-300">Recording Controls</h3>
              </div>

              {mode === "video" && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="camera-toggle" className="flex items-center gap-2 text-white">
                    <Video className="w-5 h-5" /> Camera
                  </Label>
                  <Switch
                    id="camera-toggle"
                    checked={settings.isCameraOn}
                    onCheckedChange={toggleCamera}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="noise-cancellation" className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" /> Noise Reduction
                </Label>
                <Switch
                  id="noise-cancellation"
                  checked={settings.isNoiseCancellationOn}
                  onCheckedChange={toggleNoiseCancellation}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="mic-sensitivity" className="flex items-center gap-2 text-white">
                  <Volume2 className="w-5 h-5" /> Microphone Sensitivity
                </Label>
                <Slider
                  id="mic-sensitivity"
                  defaultValue={[settings.micSensitivity]}
                  max={2}
                  min={0.5}
                  step={0.1}
                  onValueChange={(value) => setMicSensitivity(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <Camera className="mr-2 h-4 w-4" /> Switch Camera
              </Button>
            </CardContent>
          </Card>

          {/* Live Stats */}
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-300 mb-3">📊 Live Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quality:</span>
                  <span className="text-white">{audioQuality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mode:</span>
                  <span className="text-white capitalize">{mode}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="w-full max-w-4xl mb-6">
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="h-20">
              <WaveformVisualizer audioData={audioData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer and Controls */}
      <div className="flex flex-col items-center gap-6">
        {/* Large Timer Display */}
        <div className="text-center">
          <div className="text-7xl md:text-8xl font-bold font-mono tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-slate-400 mt-2">Recording Time</p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-8">
          <Button
            variant="outline"
            size="lg"
            className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-white disabled:opacity-50 w-40 h-14 text-lg"
            onClick={isPaused ? onResumeRecording : onPauseRecording}
            disabled={!isRecording && !isPaused}
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-6 w-6" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-6 w-6" />
                Pause
              </>
            )}
          </Button>

          {/* Stop Button - Large and Prominent */}
          <Button
            onClick={onStopRecording}
            className="rounded-full w-28 h-28 flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-2xl transform hover:scale-105 transition-all"
            aria-label="Stop recording"
          >
            <Square className="h-12 w-12 text-white" fill="white" />
          </Button>

          <div className="w-40">{/* Placeholder for symmetry */}</div>
        </div>
      </div>
    </div>
  )
}
