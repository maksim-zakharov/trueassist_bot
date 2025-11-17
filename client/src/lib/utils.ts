import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const numberFormat = (num: number) => new Intl.NumberFormat('en-EN').format(num);

export const moneyFormat = (num: number) => new Intl.NumberFormat('en-EN', {
  style: 'currency',
  maximumFractionDigits: 0,
  currency: 'AED',
}).format(num);