"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Bot, Download, Share2, Play, Pause } from "lucide-react"
import { useState } from "react"

interface PostRecordingUIProps {
  mediaUrl: string
  mediaType: "audio" | "video"
  onAnalyze: () => void
  onRecordAgain: () => void
}

export default function PostRecordingUI({ mediaUrl, mediaType, onAnalyze, onRecordAgain }: PostRecordingUIProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Card className="bg-slate-800/50 border-slate-700 text-white backdrop-blur-lg shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl text-blue-300 mb-2">Recording Complete! 🎉</CardTitle>
          <p className="text-slate-400 text-lg">Great job! Let's review your recording and get AI-powered feedback.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Media Player */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-inner">
            {mediaType === "video" ? (
              <video
                src={mediaUrl}
                controls
                className="w-full aspect-video"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div
                      className={`w-24 h-24 rounded-full border-4 border-blue-400 flex items-center justify-center ${isPlaying ? "animate-pulse" : ""}`}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-blue-400" />
                      ) : (
                        <Play className="w-8 h-8 text-blue-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-xl text-slate-300">Audio Recording</p>
                  <audio
                    src={mediaUrl}
                    controls
                    className="w-full max-w-md"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">2:34</div>
              <div className="text-sm text-slate-400">Duration</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">HD</div>
              <div className="text-sm text-slate-400">Quality</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{mediaType === "video" ? "Video" : "Audio"}</div>
              <div className="text-sm text-slate-400">Format</div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {/* Primary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={onRecordAgain}
                variant="outline"
                size="lg"
                className="bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 h-14 text-lg"
              >
                <RotateCcw className="mr-2 h-6 w-6" />
                Record Again
              </Button>

              <Button
                onClick={onAnalyze}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all"
              >
                <Bot className="mr-2 h-6 w-6" />
                Analyze with Nena AI
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Next Steps Hint */}
      <div className="mt-6 text-center">
        <p className="text-slate-400">
          💡 <strong>Pro Tip:</strong> Our AI will analyze your speech patterns, confidence level, and provide
          personalized coaching tips!
        </p>
      </div>
    </div>
  )
}
