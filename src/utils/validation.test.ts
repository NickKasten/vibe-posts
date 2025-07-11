import { 
  validateUserInput, 
  validatePostContent, 
  getCharacterCountDisplay, 
  isCharacterLimitExceeded,
  MAX_USER_INPUT_LENGTH,
  MAX_POST_LENGTH 
} from './validation'

describe('validateUserInput', () => {
  it('validates empty input', () => {
    const result = validateUserInput('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Input cannot be empty')
    expect(result.characterCount).toBe(0)
  })
  
  it('validates input within limit', () => {
    const result = validateUserInput('This is a valid input')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.characterCount).toBe(21)
  })
  
  it('validates input at exact limit', () => {
    const input = 'a'.repeat(MAX_USER_INPUT_LENGTH)
    const result = validateUserInput(input)
    expect(result.isValid).toBe(true)
    expect(result.characterCount).toBe(MAX_USER_INPUT_LENGTH)
  })
  
  it('rejects input exceeding limit', () => {
    const input = 'a'.repeat(MAX_USER_INPUT_LENGTH + 1)
    const result = validateUserInput(input)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe(`Input cannot exceed ${MAX_USER_INPUT_LENGTH} characters`)
    expect(result.characterCount).toBe(MAX_USER_INPUT_LENGTH + 1)
  })
})

describe('validatePostContent', () => {
  it('validates empty post content', () => {
    const result = validatePostContent('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Post content cannot be empty')
    expect(result.characterCount).toBe(0)
  })
  
  it('validates post content within limit', () => {
    const result = validatePostContent('This is a valid post')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.characterCount).toBe(20)
  })
  
  it('validates post content at exact limit', () => {
    const content = 'a'.repeat(MAX_POST_LENGTH)
    const result = validatePostContent(content)
    expect(result.isValid).toBe(true)
    expect(result.characterCount).toBe(MAX_POST_LENGTH)
  })
  
  it('rejects post content exceeding limit', () => {
    const content = 'a'.repeat(MAX_POST_LENGTH + 1)
    const result = validatePostContent(content)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe(`Post cannot exceed ${MAX_POST_LENGTH} characters`)
    expect(result.characterCount).toBe(MAX_POST_LENGTH + 1)
  })
})

describe('getCharacterCountDisplay', () => {
  it('formats character count display', () => {
    expect(getCharacterCountDisplay(50, 500)).toBe('50/500')
    expect(getCharacterCountDisplay(0, 100)).toBe('0/100')
    expect(getCharacterCountDisplay(1300, 1300)).toBe('1300/1300')
  })
})

describe('isCharacterLimitExceeded', () => {
  it('detects when limit is exceeded', () => {
    expect(isCharacterLimitExceeded(501, 500)).toBe(true)
    expect(isCharacterLimitExceeded(500, 500)).toBe(false)
    expect(isCharacterLimitExceeded(499, 500)).toBe(false)
  })
}) 