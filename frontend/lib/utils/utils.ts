import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseBackendDate(dateString: string) {
  // If the string is missing the 'Z' (UTC marker) and has no timezone offset, append 'Z'
  if (
    dateString &&
    !dateString.endsWith("Z") &&
    !/[+-]\d{2}:\d{2}$/.test(dateString)
  ) {
    return new Date(dateString + "Z");
  }
  return new Date(dateString);
}
