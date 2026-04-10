import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Production-ready slug generator
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces and underscores with dashes
 * - Removes leading/trailing dashes
 * - Collapses multiple dashes into one
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word (except space/dash)
    .replace(/[\s_]+/g, '-')       // Replace spaces and underscores with -
    .replace(/-+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')            // Trim - from start
    .replace(/-+$/, '');           // Trim - from end
}

export const FALLBACK_IMAGE = '/images/placeholders/news-placeholder.jpg';
export const FALLBACK_AVATAR = '/placeholder-user.jpg';
