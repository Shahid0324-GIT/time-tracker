import { format, formatDistance, intervalToDuration } from "date-fns";

// Format currency
export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

// Format date
export function formatDate(
  date: string | Date,
  pattern: string = "MMM dd, yyyy"
): string {
  return format(new Date(date), pattern);
}

// Format time duration (seconds to HH:MM:SS)
export function formatDurationTime(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

  const hours = String(duration.hours || 0).padStart(2, "0");
  const minutes = String(duration.minutes || 0).padStart(2, "0");
  const secs = String(duration.seconds || 0).padStart(2, "0");

  return `${hours}:${minutes}:${secs}`;
}

// Format hours (seconds to decimal hours)
export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(2);
}

// Relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

// Get initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
