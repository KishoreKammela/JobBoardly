import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
  return twMerge(clsx(inputs));
}

export function formatCurrencyINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount)))
    return 'N/A';
  if (amount === undefined || amount === null || isNaN(Number(amount)))
    return 'N/A';

  const numAmount = Number(amount);
  const absAmount = Math.abs(numAmount);
  let formattedAmount: string;

  if (absAmount >= 10000000) {
    // Crores (1 Cr = 100 Lakhs)
    const crores = numAmount / 10000000;
    formattedAmount = parseFloat(crores.toFixed(2)).toString() + ' Cr';
  } else if (absAmount >= 100000) {
    // Lakhs
    const lakhs = numAmount / 100000;
    formattedAmount = parseFloat(lakhs.toFixed(2)).toString() + 'L';
  } else if (absAmount >= 1000) {
    // Thousands
    const thousands = numAmount / 1000;
    formattedAmount = parseFloat(thousands.toFixed(1)).toString() + 'k';
  } else {
    formattedAmount = numAmount.toString();
  }
  return `₹${formattedAmount}`;
}

export interface PasswordStrength {
  isValid: boolean;
  issues: string[];
  criteria: { text: string; met: boolean }[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const issues: string[] = [];
  const criteria = [
    {
      text: 'At least 8 characters',
      met: password.length >= 8,
      regex: /.{8,}/,
    },
    {
      text: 'At least one uppercase letter',
      met: /[A-Z]/.test(password),
      regex: /[A-Z]/,
    },
    {
      text: 'At least one lowercase letter',
      met: /[a-z]/.test(password),
      regex: /[a-z]/,
    },
    {
      text: 'At least one number',
      met: /[0-9]/.test(password),
      regex: /[0-9]/,
    },
    {
      text: 'At least one special character (e.g., !@#$%^&*)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      regex: /[!@#$%^&*(),.?":{}|<>]/,
    },
  ];

  criteria.forEach((criterion) => {
    if (!criterion.met) {
      issues.push(
        criterion.text
          .replace('At least o', 'O')
          .replace(' (e.g., !@#$%^&*)', '')
      );
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    criteria: criteria.map(({ regex, ...rest }) => rest), // Don't return regex
  };
}
