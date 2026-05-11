import { Timestamp } from "firebase/firestore";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: Timestamp;
}

export type TransactionType = 'sale' | 'payment';

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  type: TransactionType;
  description: string;
  stockEntryId?: string;
  date: Timestamp;
  runningBalance?: number;
}

// --- Labour Module Types ---

export type WorkerRole = 'Overlock' | 'Singer' | 'Flat' | 'Pressman' | 'Cutting Master';
export type EmployeeType = 'Piece-rate' | 'Salary';

export interface Employee {
  id: string;
  name: string;
  type: EmployeeType;
  role: WorkerRole;
  pieceRate?: number; // Default per-piece rate for piece-rate workers
  salaryAmount?: number; // For Salary workers
  advanceBalance: number;
  createdAt: Timestamp;
}

export interface WorkLog {
  id: string;
  employeeId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  article: string;
  color: string;
  pieces: number;
  role: WorkerRole;
  rate: number;
  totalEarning: number;
}

export type LabourTransactionType = 'Earning' | 'Advance Taken' | 'Advance Deduction' | 'Final Payout';

export interface LabourTransaction {
  id: string;
  employeeId: string;
  type: LabourTransactionType;
  amount: number;
  adjustedAdvance?: number;
  date: Timestamp;
  description: string;
  periodStart?: Timestamp;
  periodEnd?: Timestamp;
  runningBalance?: number;
}

export const ROLE_RATES: Record<WorkerRole, number> = {
  'Overlock': 17,
  'Singer': 15, // Default for Singer
  'Flat': 4,
  'Pressman': 10,
  'Cutting Master': 0 // Usually salary
};

// --- Stock Module Types ---
export type ProductType = "T-shirt" | "Nikar Suit" | "Track Suit";
export type StockEntryType = "in" | "out";

export interface StockEntry {
  id: string;
  productType: ProductType;
  type: StockEntryType;
  color: string;
  pieces: number;
  customerId?: string;
  customerName?: string;
  date: Timestamp;
  description?: string;
}
