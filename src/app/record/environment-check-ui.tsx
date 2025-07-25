"use client"

import type { RecorderState, RecorderControls } from "@/hooks/use-advanced-recorder"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Video, Mic, Lightbulb, Waves, Settings } from "lucide-react"
import LivePreview from "@/components/record/live-preview"
import StatusIndicator from "@/components/record/status-indicator"

interface EnvironmentCheckUIProps {
  isReady: boolean
  onCheckComplete: () => void
  onStartRecording: () => void
  recorderState: RecorderState
  controls: RecorderControls
}

export default function EnvironmentCheckUI({
  isReady,
  onCheckComplete,
  onStartRecording,
  recorderState,
  controls,
}: EnvironmentCheckUIProps) {
  const { permissions, lighting, noise } = recorderState.analysis
  const { mode } = recorderState
  const { toggleMode } = controls

  const allChecksPassed = permissions.video && permissions.audio && lighting === "Good" && noise === "Quiet"

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 px-4">
      {/* Left Side - Live Preview */}
      <div className="w-full lg:w-3/5 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ready to Record?
          </h1>
          <p className="text-xl text-slate-300">Let's make sure everything looks and sounds perfect</p>
        </div>

        <div className="relative">
          <LivePreview stream={recorderState.stream} mode={mode} />

          {/* Recording Mode Toggle */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="inline-flex items-center bg-black/70 backdrop-blur-sm rounded-full p-1 border border-white/20">
              <Button
                onClick={() => toggleMode("audio")}
                size="sm"
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  mode === "audio"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-transparent text-slate-300 hover:bg-white/10"
                }`}
              >
                <Mic className="mr-2 h-4 w-4" /> Audio Only
              </Button>
              <Button
                onClick={() => toggleMode("video")}
                size="sm"
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  mode === "video"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-transparent text-slate-300 hover:bg-white/10"
                }`}
              >
                <Video className="mr-2 h-4 w-4" /> Video + Audio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Environment Check */}
      <div className="w-full lg:w-2/5 space-y-6">
        <Card className="bg-slate-800/50 border-slate-700 text-white backdrop-blur-lg shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-blue-300">Environment Check</CardTitle>
            <p className="text-slate-400">Ensuring optimal recording conditions</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <StatusIndicator
              icon={Video}
              label="Camera Access"
              status={permissions.video ? "Granted" : "Requesting..."}
              isOk={permissions.video}
              tip="Please allow camera access to record video."
            />

            <StatusIndicator
              icon={Mic}
              label="Microphone Access"
              status={permissions.audio ? "Granted" : "Requesting..."}
              isOk={permissions.audio}
              tip="Please allow microphone access to record audio."
            />

            <StatusIndicator
              icon={Lightbulb}
              label="Lighting Quality"
              status={lighting}
              isOk={lighting === "Good"}
              tip="Face a light source. Avoid sitting with a bright window behind you."
            />

            <StatusIndicator
              icon={Waves}
              label="Background Noise"
              status={noise}
              isOk={noise === "Quiet"}
              tip="Find a quiet space to minimize background noise for clearer audio."
            />

            {/* Progress Indicator */}
            <div className="pt-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Setup Progress</span>
                <span>{allChecksPassed ? "100%" : "75%"}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    allChecksPassed ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: allChecksPassed ? "100%" : "75%" }}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-6">
            {isReady ? (
              <Button
                onClick={onStartRecording}
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg font-semibold py-3 shadow-lg transform hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  Start Recording
                </div>
              </Button>
            ) : (
              <Button
                onClick={onCheckComplete}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-lg font-semibold py-3 shadow-lg transition-all"
                disabled={!allChecksPassed}
              >
                {allChecksPassed ? "Continue to Recording" : "Checking Environment..."}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-300 mb-2">💡 Quick Tips</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Sit up straight and look directly at the camera</li>
              <li>• Speak clearly and at a natural pace</li>
              <li>• Keep your hands visible and use natural gestures</li>
              <li>• Take a deep breath and be yourself!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
