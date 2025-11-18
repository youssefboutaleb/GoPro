/**
 * Utility functions for recruitment rhythm calculations
 */

export interface MonthlyData {
  achievements: number[];
  monthlyTarget: number;
}

export interface RateCalculationResult {
  rate: number | null;
  rowColor: 'red' | 'yellow' | 'green' | 'gray';
}

export interface RhythmeCalculationResult {
  rythme: number | null;
}

/**
 * Calculate the average realization rate for past months
 */
export const calculateRate = (
  achievements: number[],
  monthlyTarget: number,
  currentMonthIndex: number
): RateCalculationResult => {
  const visibleMonths = achievements.slice(0, currentMonthIndex);
  const ratios = visibleMonths
    .map(a => monthlyTarget > 0 ? (a / monthlyTarget) * 100 : null)
    .filter(v => v !== null) as number[];

  const rate = ratios.length > 0
    ? Math.round(ratios.reduce((sum, v) => sum + v, 0) / ratios.length)
    : null;

  const rowColor = getRowColor(rate);

  return { rate, rowColor };
};

/**
 * Calculate the recruitment rhythm
 */
export const calculateRythme = (
  achievements: number[],
  monthlyTarget: number,
  currentMonthIndex: number
): RhythmeCalculationResult => {
  const m = currentMonthIndex + 1; // Jan=1
  const prev = achievements.slice(0, m - 1);
  const avgPrev = prev.length > 0
    ? prev.reduce((sum, v) => sum + v, 0) / prev.length
    : null;
  const denom = ((14 - m) * (13 - m)) / 2;

  let rythme = null;
  if (avgPrev !== null && monthlyTarget > 0 && denom > 0) {
    rythme = ((monthlyTarget - avgPrev) * 12) / denom;
    rythme = Math.max(0, Math.round(rythme));
  }

  return { rythme };
};

/**
 * Determine row color based on rate
 */
export const getRowColor = (rate: number | null): 'red' | 'yellow' | 'green' | 'gray' => {
  if (rate === null) return 'gray';
  if (rate < 80) return 'red';
  if (rate <= 100) return 'yellow';
  return 'green';
};

/**
 * Get color class for rate badge
 */
export const getRateColorClass = (rate: number | null): string => {
  if (rate === null) return 'bg-muted text-muted-foreground';
  if (rate < 80) return 'bg-destructive text-destructive-foreground';
  if (rate <= 100) return 'bg-warning text-warning-foreground';
  return 'bg-success text-success-foreground';
};

/**
 * Get color class for table row
 */
export const getRowColorClass = (color: 'red' | 'yellow' | 'green' | 'gray'): string => {
  const colors = {
    red: 'bg-destructive/10 hover:bg-destructive/20',
    yellow: 'bg-warning/10 hover:bg-warning/20',
    green: 'bg-success/10 hover:bg-success/20',
    gray: 'bg-muted/10 hover:bg-muted/20'
  };
  return colors[color];
};

/**
 * Format number with French locale
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '–';
  return Math.round(value).toLocaleString('fr-FR');
};
