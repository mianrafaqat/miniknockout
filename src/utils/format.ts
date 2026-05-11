import { Timestamp } from "firebase/firestore";

/**
 * Formats a number as PKR (Pakistani Rupee) currency string
 */
export const formatPKR = (amount: number): string => {
  return amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Formats a Firestore Timestamp or Date into a readable Pakistani date string
 */
export const formatDate = (date: Date | Timestamp | undefined): string => {
  if (!date) return "---";
  
  const d = date instanceof Timestamp ? date.toDate() : date;
  
  return d.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

/**
 * Formats a date for input[type="date"]
 */
export const formatDateForInput = (date: Date | Timestamp | undefined): string => {
  if (!date) return "";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toISOString().split('T')[0];
};
