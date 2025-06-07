import { describe, it, expect } from 'vitest';
import { isWeekend, isWorkingDay, getWorkingDaysBetween, parseISODate } from './dateUtils';

describe('dateUtils', () => {
  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      // 2023-07-01 was a Saturday
      const saturday = new Date(2023, 6, 1);
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      // 2023-07-02 was a Sunday
      const sunday = new Date(2023, 6, 2);
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekdays', () => {
      // 2023-07-03 was a Monday
      const monday = new Date(2023, 6, 3);
      expect(isWeekend(monday)).toBe(false);

      // 2023-07-04 was a Tuesday
      const tuesday = new Date(2023, 6, 4);
      expect(isWeekend(tuesday)).toBe(false);

      // 2023-07-05 was a Wednesday
      const wednesday = new Date(2023, 6, 5);
      expect(isWeekend(wednesday)).toBe(false);

      // 2023-07-06 was a Thursday
      const thursday = new Date(2023, 6, 6);
      expect(isWeekend(thursday)).toBe(false);

      // 2023-07-07 was a Friday
      const friday = new Date(2023, 6, 7);
      expect(isWeekend(friday)).toBe(false);
    });
  });

  describe('isWorkingDay', () => {
    it('should return false for weekend days', () => {
      // 2023-07-01 was a Saturday
      const saturday = new Date(2023, 6, 1);
      expect(isWorkingDay(saturday)).toBe(false);

      // 2023-07-02 was a Sunday
      const sunday = new Date(2023, 6, 2);
      expect(isWorkingDay(sunday)).toBe(false);
    });

    it('should return true for weekdays', () => {
      // 2023-07-03 was a Monday
      const monday = new Date(2023, 6, 3);
      expect(isWorkingDay(monday)).toBe(true);

      // 2023-07-07 was a Friday
      const friday = new Date(2023, 6, 7);
      expect(isWorkingDay(friday)).toBe(true);
    });
  });

  describe('getWorkingDaysBetween', () => {
    it('should count working days between two dates (inclusive)', () => {
      // Monday to Friday = 5 working days
      const monday = new Date(2023, 6, 3);
      const friday = new Date(2023, 6, 7);
      expect(getWorkingDaysBetween(monday, friday)).toBe(5);
    });

    it('should handle weekend days correctly', () => {
      // Friday to Monday = 2 working days (Friday and Monday)
      const friday = new Date(2023, 6, 7);
      const monday = new Date(2023, 6, 10);
      expect(getWorkingDaysBetween(friday, monday)).toBe(2);
    });

    it('should handle dates in reverse order', () => {
      // Passing end date first and start date second should give same result
      const monday = new Date(2023, 6, 3);
      const friday = new Date(2023, 6, 7);
      expect(getWorkingDaysBetween(friday, monday)).toBe(5);
    });

    it('should return 0 for same day on weekend', () => {
      // Same day on weekend = 0 working days
      const saturday = new Date(2023, 6, 1);
      expect(getWorkingDaysBetween(saturday, saturday)).toBe(0);
    });

    it('should return 1 for same day on weekday', () => {
      // Same day on weekday = 1 working day
      const monday = new Date(2023, 6, 3);
      expect(getWorkingDaysBetween(monday, monday)).toBe(1);
    });

    it('should handle longer periods correctly', () => {
      // Two full weeks = 10 working days
      const monday1 = new Date(2023, 6, 3);
      const friday2 = new Date(2023, 6, 14);
      expect(getWorkingDaysBetween(monday1, friday2)).toBe(10);
    });
  });

  describe('parseISODate', () => {
    it('should parse ISO date strings correctly', () => {
      const isoString = '2023-07-03T12:00:00Z';
      const date = parseISODate(isoString);
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getUTCFullYear()).toBe(2023);
      expect(date.getUTCMonth()).toBe(6); // July is 6 (zero-based)
      expect(date.getUTCDate()).toBe(3);
    });
  });
});