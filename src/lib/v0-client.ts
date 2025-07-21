import fetch from 'node-fetch';

// TypeScript interfaces
export interface V0Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface V0ChatRequest {
  messages: V0Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface V0Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface V0Choice {
  index: number;
  message: V0Message;
  finish_reason: string;
}

export interface V0ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: V0Choice[];
  usage: V0Usage;
}

export interface V0StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export interface V0ClientOptions {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface GenerateComponentOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ComponentGenerationResult {
  component: string;
  usage: V0Usage;
  cost: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
  };
}

export class V0ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'V0ApiError';
  }
}

export class V0ApiClient {
  private apiKey: string;
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  // Token pricing (approximate - update based on actual v0 pricing)
  private readonly TOKEN_PRICING = {
    prompt: 0.0015 / 1000, // per token
    completion: 0.002 / 1000, // per token
  };

  constructor(options: V0ClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.V0_API_KEY || '';
    this.baseURL = options.baseURL || 'https://api.v0.dev/v1';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;

    if (!this.apiKey) {
      throw new V0ApiError('V0 API key is required. Set V0_API_KEY environment variable or pass apiKey in options.');
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateCost(usage: V0Usage) {
    const promptCost = usage.prompt_tokens * this.TOKEN_PRICING.prompt;
    const completionCost = usage.completion_tokens * this.TOKEN_PRICING.completion;
    return {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      estimatedCostUSD: promptCost + completionCost,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Nena-V0-Client/1.0.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');

        // Retry on specific status codes
        if (attempt < this.maxRetries && [429, 502, 503, 504].includes(response.status)) {
          await this.sleep(this.retryDelay * attempt);
          return this.makeRequest<T>(endpoint, options, attempt + 1);
        }

        throw new V0ApiError(
          `API request failed: ${response.status} ${response.statusText}\n${errorBody}`,
          response.status,
          errorBody
        );
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof V0ApiError) {
        throw error;
      }

      // Retry on network errors
      if (attempt < this.maxRetries && (error.name === 'AbortError' || error.code === 'ECONNRESET')) {
        await this.sleep(this.retryDelay * attempt);
        return this.makeRequest<T>(endpoint, options, attempt + 1);
      }

      throw new V0ApiError(
        `Network error: ${error.message}`,
        undefined,
        error
      );
    }
  }

  public async chatCompletion(request: V0ChatRequest): Promise<V0ChatResponse> {
    const response = await this.makeRequest<V0ChatResponse>('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'v0-1',
        temperature: 0.7,
        max_tokens: 4000,
        ...request,
        stream: false,
      }),
    });

    return response;
  }

  public async *chatCompletionStream(request: V0ChatRequest): AsyncGenerator<V0StreamChunk> {
    const url = `${this.baseURL}/chat/completions`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Nena-V0-Client/1.0.0',
        },
        body: JSON.stringify({
          model: 'v0-1',
          temperature: 0.7,
          max_tokens: 4000,
          ...request,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new V0ApiError(
          `Streaming API request failed: ${response.status} ${response.statusText}\n${errorBody}`,
          response.status,
          errorBody
        );
      }

      if (!response.body) {
        throw new V0ApiError('No response body received for streaming request');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6);

              if (data === '[DONE]') {
                return;
              }

              try {
                const chunk = JSON.parse(data) as V0StreamChunk;
                yield chunk;
              } catch (parseError) {
                console.warn('Failed to parse streaming chunk:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof V0ApiError) {
        throw error;
      }
      throw new V0ApiError(`Streaming error: ${error.message}`, undefined, error);
    }
  }

  public async generateComponent(options: GenerateComponentOptions): Promise<ComponentGenerationResult> {
    const systemPrompt = `You are a skilled React developer. Generate clean, modern React components using TypeScript and Tailwind CSS.

Guidelines:
- Use functional components with hooks
- Include proper TypeScript interfaces/types
- Use Tailwind CSS for styling
- Make components responsive and accessible
- Include meaningful prop validation
- Follow React best practices
- Export the component as default
- Add brief JSDoc comments for complex components

Generate only the React component code, no explanations or markdown formatting.`;

    const request: V0ChatRequest = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: options.prompt },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      stream: options.stream || false,
    };

    if (options.stream) {
      throw new V0ApiError('Streaming is not yet supported for generateComponent. Use chatCompletionStream directly.');
    }

    const response = await this.chatCompletion(request);

    if (!response.choices || response.choices.length === 0) {
      throw new V0ApiError('No component generated in response');
    }

    const component = response.choices[0].message.content;
    const cost = this.calculateCost(response.usage);

    return {
      component,
      usage: response.usage,
      cost,
    };
  }

  public async generateComponentWithIterations(
    initialPrompt: string,
    iterations: string[],
    options: Omit<GenerateComponentOptions, 'prompt'> = {}
  ): Promise<ComponentGenerationResult> {
    const systemPrompt = `You are a skilled React developer. Generate and refine React components based on user feedback.

Guidelines:
- Use functional components with hooks
- Include proper TypeScript interfaces/types
- Use Tailwind CSS for styling
- Make components responsive and accessible
- Follow React best practices
- Export the component as default

Generate only the React component code, no explanations.`;

    const messages: V0Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: initialPrompt },
    ];

    // Add iterations as conversation history
    for (let i = 0; i < iterations.length; i++) {
      // Add a placeholder assistant response (in real usage, you'd store previous responses)
      messages.push({ role: 'assistant', content: '// Previous component iteration...' });
      messages.push({ role: 'user', content: iterations[i] });
    }

    const request: V0ChatRequest = {
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      stream: false,
    };

    const response = await this.chatCompletion(request);

    if (!response.choices || response.choices.length === 0) {
      throw new V0ApiError('No component generated in response');
    }

    const component = response.choices[0].message.content;
    const cost = this.calculateCost(response.usage);

    return {
      component,
      usage: response.usage,
      cost,
    };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest<any>('/models', {
        method: 'GET',
      });
      return !!response;
    } catch {
      return false;
    }
  }

  public getEstimatedCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.TOKEN_PRICING.prompt) + (completionTokens * this.TOKEN_PRICING.completion);
  }
}

// Export a default instance for convenience
export const v0Client = new V0ApiClient();

// Utility functions
export function createV0Prompt(
  componentDescription: string,
  requirements: string[] = [],
  styling: string = 'modern and clean'
): string {
  const requirementsText = requirements.length > 0
    ? `\n\nSpecific requirements:\n${requirements.map(req => `- ${req}`).join('\n')}`
    : '';

  return `Create a React component for ${componentDescription}.

The component should be ${styling} with a professional appearance.${requirementsText}

Please ensure the component is:
- Fully responsive
- Accessible (proper ARIA labels, keyboard navigation)
- Uses TypeScript with proper type definitions
- Styled with Tailwind CSS
- Follows modern React patterns (functional components, hooks)
- Has meaningful prop names and default values`;
}

export function extractComponentName(componentCode: string): string | null {
  const match = componentCode.match(/(?:export\s+default\s+|const\s+|function\s+)([A-Z][a-zA-Z0-9]*)/);
  return match ? match[1] : null;
}