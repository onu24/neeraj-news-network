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
    .replace(/[^\p{L}\p{N}\s-]/gu, '')  // Preserves Unicode letters (Hindi) and numbers
    .replace(/[\s_]+/g, '-')            // Replace spaces and underscores with -
    .replace(/-+/g, '-')                // Replace multiple - with single -
    .replace(/^-+/, '')                 // Trim - from start
    .replace(/-+$/, '');                // Trim - from end
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop';
export const FALLBACK_AVATAR = '/placeholder-user.jpg';
