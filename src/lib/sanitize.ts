export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/```/g, '')
    .replace(/System:/g, '')
    .replace(/Assistant:/g, '')
    .replace(/[^\w\s.,!?_()[\]{}-]/g, '')
    .slice(0, 500)
} 