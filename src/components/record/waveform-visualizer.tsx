"use client"

import { useRef, useEffect } from "react"

interface WaveformVisualizerProps {
  audioData: Uint8Array | null
}

const WaveformVisualizer = ({ audioData }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioData) return

    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d")
    if (!context) return

    context.clearRect(0, 0, width, height)
    context.lineWidth = 2
    context.strokeStyle = "rgba(59, 130, 246, 0.7)" // blue-500 with opacity
    context.beginPath()

    const sliceWidth = (width * 1.0) / audioData.length
    let x = 0

    for (let i = 0; i < audioData.length; i++) {
      const v = audioData[i] / 128.0
      const y = (v * height) / 2

      if (i === 0) {
        context.moveTo(x, y)
      } else {
        context.lineTo(x, y)
      }

      x += sliceWidth
    }

    context.lineTo(width, height / 2)
    context.stroke()
  }, [audioData])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

export default WaveformVisualizer
