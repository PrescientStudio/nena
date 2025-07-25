export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes === 0) {
    return `${remainingSeconds}s`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

export function formatChange(value: number, unit: string = '', showSign: boolean = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}${unit}`
}

export function calculateConfidenceLevel(score: number): {
  level: string
  color: string
  description: string
} {
  if (score >= 0.9) {
    return {
      level: 'Excellent',
      color: 'text-green-600',
      description: 'Outstanding confidence!'
    }
  } else if (score >= 0.8) {
    return {
      level: 'Great',
      color: 'text-blue-600',
      description: 'Strong and confident'
    }
  } else if (score >= 0.7) {
    return {
      level: 'Good',
      color: 'text-yellow-600',
      description: 'Building confidence'
    }
  } else if (score >= 0.6) {
    return {
      level: 'Fair',
      color: 'text-orange-600',
      description: 'Getting there'
    }
  } else {
    return {
      level: 'Needs Work',
      color: 'text-red-600',
      description: 'Keep practicing!'
    }
  }
}

export function getPaceStatus(wpm: number): {
  status: string
  color: string
  advice: string
} {
  if (wpm >= 140 && wpm <= 160) {
    return {
      status: 'Perfect',
      color: 'text-green-600',
      advice: 'Ideal speaking pace!'
    }
  } else if (wpm > 160 && wpm <= 180) {
    return {
      status: 'Fast',
      color: 'text-yellow-600',
      advice: 'Try slowing down a bit'
    }
  } else if (wpm > 180) {
    return {
      status: 'Too Fast',
      color: 'text-red-600',
      advice: 'Slow down for better clarity'
    }
  } else if (wpm >= 120 && wpm < 140) {
    return {
      status: 'Slow',
      color: 'text-yellow-600',
      advice: 'Try speaking a bit faster'
    }
  } else {
    return {
      status: 'Too Slow',
      color: 'text-red-600',
      advice: 'Increase your pace'
    }
  }
}