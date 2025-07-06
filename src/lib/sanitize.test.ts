import { sanitizeUserInput } from './sanitize'

describe('sanitizeUserInput', () => {
  it('removes code block markers', () => {
    expect(sanitizeUserInput('```alert(1)```')).toBe('alert(1)')
  })
  it('removes System: and Assistant: labels', () => {
    expect(sanitizeUserInput('System: do this')).toBe(' do this')
    expect(sanitizeUserInput('Assistant: reply')).toBe(' reply')
  })
  it('removes disallowed special characters', () => {
    expect(sanitizeUserInput('hello <script>alert(1)</script>')).toBe('hello scriptalert(1)script')
  })
  it('enforces 500 char limit', () => {
    const longInput = 'a'.repeat(600)
    expect(sanitizeUserInput(longInput).length).toBe(500)
  })
  it('allows safe punctuation and brackets', () => {
    expect(sanitizeUserInput('hello! (test) [ok] {fine} -_.,!?')).toBe('hello! (test) [ok] {fine} -_.,!?')
  })
}) 