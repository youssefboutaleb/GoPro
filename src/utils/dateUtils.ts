/**
 * Date utility functions
 */

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
] as const;

/**
 * Get the last day of a specific month
 */
export const getLastDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get month names up to current month
 */
export const getVisibleMonthNames = (): string[] => {
  const currentMonth = new Date().getMonth() + 1;
  return Array.from(MONTH_NAMES).slice(0, currentMonth);
};

/**
 * Get current year
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Get current month (1-indexed)
 */
export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1;
};

/**
 * Get current month index (0-indexed)
 */
export const getCurrentMonthIndex = (): number => {
  return new Date().getMonth();
};
