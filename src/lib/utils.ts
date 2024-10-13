import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildQueryString(params: { [key: string]: any }): string {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key]) {
      query.set(key, params[key]);
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}
