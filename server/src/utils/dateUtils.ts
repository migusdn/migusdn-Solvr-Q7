/**
 * Utility functions for date operations, specifically for working day calculations
 */

/**
 * Checks if a given date is a weekend (Saturday or Sunday)
 * @param date The date to check
 * @returns True if the date is a weekend, false otherwise
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  // 0 is Sunday, 6 is Saturday
  return day === 0 || day === 6;
}

/**
 * Checks if a given date is a working day (not a weekend)
 * @param date The date to check
 * @returns True if the date is a working day, false otherwise
 */
export function isWorkingDay(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Calculates the number of working days between two dates (inclusive)
 * @param startDate The start date
 * @param endDate The end date
 * @returns The number of working days between the two dates
 */
export function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  // Ensure startDate is before or equal to endDate
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  
  // Clone dates to avoid modifying the original objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set to the beginning of the day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  let workingDays = 0;
  const current = new Date(start);
  
  // Iterate through each day and count working days
  while (current <= end) {
    if (isWorkingDay(current)) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

/**
 * Parses an ISO date string to a Date object
 * @param dateString ISO date string (e.g., "2023-01-01T12:00:00Z")
 * @returns Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

export default {
  isWeekend,
  isWorkingDay,
  getWorkingDaysBetween,
  parseISODate
};