import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildQueryString(params: { [key: string]: any }): string {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) { // Verifica solo null o undefined
      query.set(key, String(params[key])); // Convertir a cadena para evitar problemas con valores no string
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

