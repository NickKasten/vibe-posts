export const MAX_USER_INPUT_LENGTH = 500
export const MAX_POST_LENGTH = 1300

export interface ValidationResult {
  isValid: boolean
  error?: string
  characterCount: number
}

export const validateUserInput = (input: string): ValidationResult => {
  const characterCount = input.length
  
  if (characterCount === 0) {
    return {
      isValid: false,
      error: 'Input cannot be empty',
      characterCount: 0
    }
  }
  
  if (characterCount > MAX_USER_INPUT_LENGTH) {
    return {
      isValid: false,
      error: `Input cannot exceed ${MAX_USER_INPUT_LENGTH} characters`,
      characterCount
    }
  }
  
  return {
    isValid: true,
    characterCount
  }
}

export const validatePostContent = (content: string): ValidationResult => {
  const characterCount = content.length
  
  if (characterCount === 0) {
    return {
      isValid: false,
      error: 'Post content cannot be empty',
      characterCount: 0
    }
  }
  
  if (characterCount > MAX_POST_LENGTH) {
    return {
      isValid: false,
      error: `Post cannot exceed ${MAX_POST_LENGTH} characters`,
      characterCount
    }
  }
  
  return {
    isValid: true,
    characterCount
  }
}

export const getCharacterCountDisplay = (current: number, max: number): string => {
  return `${current}/${max}`
}

export const isCharacterLimitExceeded = (current: number, max: number): boolean => {
  return current > max
} 