import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gộp class Tailwind, class sau thắng class trước khi trùng nhóm. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
