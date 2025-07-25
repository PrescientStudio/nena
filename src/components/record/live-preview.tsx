"use client"

import { useEffect, useRef } from "react"
import { Mic, VideoOff } from "lucide-react"

interface LivePreviewProps {
  stream: MediaStream | null
  mode: "audio" | "video"
}

export default function LivePreview({ stream, mode }: LivePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (mode === "audio") {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Mic className="w-24 h-24 mx-auto mb-4" />
          <p className="text-xl font-semibold">Audio Only Mode</p>
          <p className="text-slate-500 mt-2">Your voice will be captured</p>
        </div>
      </div>
    )
  }

  const isCameraOff = stream?.getVideoTracks().every((track) => !track.enabled)

  return (
    <div className="w-full aspect-video bg-black rounded-xl relative overflow-hidden shadow-2xl">
      <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover ${isCameraOff ? "hidden" : ""}`} />
      {isCameraOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
          <VideoOff className="w-24 h-24 mb-4" />
          <p className="text-xl font-semibold">Camera is off</p>
          <p className="text-slate-500 mt-2">Enable camera to see video preview</p>
        </div>
      )}
    </div>
  )
}
