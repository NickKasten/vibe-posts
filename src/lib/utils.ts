// Utility for conditional className merging (used by shadcn/ui)
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: any[]) {
  return twMerge(clsx(...inputs))
} 