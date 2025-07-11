export const POST_STYLES = [
  {
    id: 'technical',
    name: 'Technical',
    description: 'Professional and technical tone with code insights'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Conversational and approachable'
  },
  {
    id: 'inspiring',
    name: 'Inspiring',
    description: 'Motivational and thought-provoking'
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Teaching and knowledge-sharing focused'
  }
] as const

export const AI_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 models'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models'
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Gemini models'
  },
  {
    id: 'groq',
    name: 'Groq (Free)',
    description: 'Fast Llama 3.1 models'
  }
] as const

export const MAX_POST_LENGTH = 3000
export const MAX_CONTEXT_LENGTH = 1000
export const MAX_HASHTAGS = 10