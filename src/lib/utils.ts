import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount)))
    return 'N/A';

  const numAmount = Number(amount);
  const absAmount = Math.abs(numAmount);
  let formattedAmount: string;

  if (absAmount >= 10000000) {
    // Crores (1 Cr = 100 Lakhs)
    // For crores, typically show up to 2 decimal places if needed, otherwise whole number.
    const crores = numAmount / 10000000;
    formattedAmount = parseFloat(crores.toFixed(2)).toString() + ' Cr';
  } else if (absAmount >= 100000) {
    // Lakhs
    // For lakhs, typically show up to 2 decimal places if needed.
    const lakhs = numAmount / 100000;
    formattedAmount = parseFloat(lakhs.toFixed(2)).toString() + 'L';
  } else if (absAmount >= 1000) {
    // Thousands
    // For thousands, typically show up to 1 decimal place if needed.
    const thousands = numAmount / 1000;
    formattedAmount = parseFloat(thousands.toFixed(1)).toString() + 'k';
  } else {
    formattedAmount = numAmount.toString();
  }
  return `₹${formattedAmount}`;
}
