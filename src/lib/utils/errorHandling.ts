export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'UNKNOWN_ERROR'
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleServiceError(error: unknown, context: string): APIError {
  console.error(`${context} error:`, error)
  
  if (error instanceof APIError) {
    return error
  }
  
  if (error instanceof Error) {
    return new APIError(
      `${context}: ${error.message}`,
      500,
      'SERVICE_ERROR'
    )
  }
  
  return new APIError(
    `${context}: Unknown error occurred`,
    500,
    'UNKNOWN_ERROR'
  )
}
