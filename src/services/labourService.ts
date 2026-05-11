import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  addDoc, 
  getDocs,
  updateDoc,
  increment, 
  serverTimestamp,
  Timestamp,
  runTransaction,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Employee, LabourTransaction, WorkerRole, ROLE_RATES } from "@/types";

export const labourService = {
  // --- Employee Operations ---
  
  subscribeToEmployees: (callback: (employees: Employee[]) => void) => {
    const q = query(collection(db, "employees"), orderBy("name", "asc"));
    return onSnapshot(q, (snapshot) => {
      const employees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
      callback(employees);
    });
  },

  addEmployee: async (data: Omit<Employee, 'id' | 'createdAt' | 'advanceBalance'>) => {
    // Remove undefined fields for Firestore compatibility
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    
    return await addDoc(collection(db, "employees"), {
      ...cleanData,
      advanceBalance: 0,
      createdAt: serverTimestamp(),
    });
  },

  // --- Work Log Operations ---

  addWeeklyWork: async (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    article: string,
    color: string,
    pieces: number,
    role: WorkerRole,
    customRate?: number
  ) => {
    return await runTransaction(db, async (transaction) => {
      const employeeRef = doc(db, "employees", employeeId);
      const employeeSnap = await transaction.get(employeeRef);
      const employeeData = employeeSnap.data() as Employee | undefined;
      const effectiveRate = customRate ?? employeeData?.pieceRate ?? ROLE_RATES[role] ?? 0;
      const totalEarning = pieces * effectiveRate;

      // 1. Add Work Log
      const workLogRef = doc(collection(db, "workLogs"));
      transaction.set(workLogRef, {
        employeeId,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        article,
        color,
        pieces,
        role,
        rate: effectiveRate,
        totalEarning,
        createdAt: serverTimestamp(),
      });

      // 2. Add to Labour Ledger as Earning
      const ledgerRef = doc(collection(db, "labourLedger"));
      transaction.set(ledgerRef, {
        employeeId,
        type: 'Earning',
        amount: totalEarning,
        date: Timestamp.fromDate(endDate),
        periodStart: Timestamp.fromDate(startDate),
        periodEnd: Timestamp.fromDate(endDate),
        description: `${article} (${color}) - ${pieces} pcs @ PKR ${effectiveRate} (${role})`,
        createdAt: serverTimestamp(),
      });
    });
  },

  // --- Advance & Payout Operations ---

  recordAdvance: async (employeeId: string, amount: number, description: string, date?: Date) => {
    return await runTransaction(db, async (transaction) => {
      const employeeRef = doc(db, "employees", employeeId);
      const effectiveDate = date ? Timestamp.fromDate(date) : Timestamp.now();
      
      // 1. Create Ledger Entry
      const ledgerRef = doc(collection(db, "labourLedger"));
      transaction.set(ledgerRef, {
        employeeId,
        type: 'Advance Taken',
        amount,
        date: effectiveDate,
        description,
        createdAt: serverTimestamp(),
      });

      // 2. Update Employee Advance Balance (Increment)
      transaction.update(employeeRef, {
        advanceBalance: increment(amount)
      });
    });
  },

  processPayout: async (
    employeeId: string,
    periodStart: Date,
    periodEnd: Date,
    earningAmount: number,
    deductionAmount: number,
    finalAmount: number,
    summary?: string,
    paidBy?: string,
    payoutNote?: string
  ) => {
    return await runTransaction(db, async (transaction) => {
      const employeeRef = doc(db, "employees", employeeId);
      const now = Timestamp.now();

      // Update advance balance in background, but keep only one payout entry in ledger.
      if (deductionAmount > 0) {
        transaction.update(employeeRef, {
          advanceBalance: increment(-deductionAmount),
        });
      }

      // Create a single payment entry in the ledger.
      const payoutRef = doc(collection(db, "labourLedger"));
      const actor = paidBy?.trim() ? `Cash paid by ${paidBy.trim()}` : "Cash paid";
      const note = payoutNote?.trim() ? ` - ${payoutNote.trim()}` : "";
      transaction.set(payoutRef, {
        employeeId,
        type: 'Final Payout',
        amount: finalAmount,
        adjustedAdvance: deductionAmount,
        date: now,
        periodStart: Timestamp.fromDate(periodStart),
        periodEnd: Timestamp.fromDate(periodEnd),
        description: `${actor} (after PKR ${deductionAmount} deduction)${note}`,
        createdAt: serverTimestamp(),
      });
    });
  },

  updateLedgerEntry: async (
    employeeId: string,
    entryId: string,
    previous: LabourTransaction,
    updates: {
      amount: number;
      description: string;
      date: Date;
      periodStart?: Date;
      periodEnd?: Date;
    }
  ) => {
    await runTransaction(db, async (transaction) => {
      const entryRef = doc(db, "labourLedger", entryId);

      transaction.update(entryRef, {
        amount: updates.amount,
        description: updates.description,
        date: Timestamp.fromDate(updates.date),
        periodStart: updates.periodStart ? Timestamp.fromDate(updates.periodStart) : null,
        periodEnd: updates.periodEnd ? Timestamp.fromDate(updates.periodEnd) : null,
      });
    });
    await labourService.reconcileAdvanceBalance(employeeId);
  },

  deleteLedgerEntry: async (employeeId: string, entry: LabourTransaction) => {
    await runTransaction(db, async (transaction) => {
      const entryRef = doc(db, "labourLedger", entry.id);

      transaction.delete(entryRef);
    });
    await labourService.reconcileAdvanceBalance(employeeId);
  },

  reconcileAdvanceBalance: async (employeeId: string) => {
    const employeeRef = doc(db, "employees", employeeId);
    const employeeLedgerQuery = query(
      collection(db, "labourLedger"),
      where("employeeId", "==", employeeId)
    );

    const ledgerSnapshot = await getDocs(employeeLedgerQuery);
    let advanceTaken = 0;
    let advanceDeducted = 0;

    ledgerSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as LabourTransaction;
      if (data.type === "Advance Taken") advanceTaken += data.amount || 0;
      if (data.type === "Advance Deduction") advanceDeducted += data.amount || 0;
    });

    await updateDoc(employeeRef, {
      advanceBalance: Math.max(advanceTaken - advanceDeducted, 0),
    });
  },

  subscribeToEmployeeLedger: (employeeId: string, callback: (transactions: LabourTransaction[]) => void) => {
    const withOrder = query(
      collection(db, "labourLedger"),
      where("employeeId", "==", employeeId),
      orderBy("date", "desc")
    );

    const withoutOrder = query(
      collection(db, "labourLedger"),
      where("employeeId", "==", employeeId)
    );

    const mapAndSort = (snapshot: { docs: Array<{ id: string; data: () => unknown }> }) => {
      const transactions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<LabourTransaction, "id">),
        }))
        .sort((a, b) => {
          const aDate = a.date?.toMillis?.() ?? 0;
          const bDate = b.date?.toMillis?.() ?? 0;
          return bDate - aDate;
        }) as LabourTransaction[];
      callback(transactions);
    };

    let unsubscribeFallback: (() => void) | null = null;
    const unsubscribePrimary = onSnapshot(
      withOrder,
      (snapshot) => mapAndSort(snapshot),
      (error) => {
        if (error.code === "failed-precondition") {
          unsubscribeFallback = onSnapshot(withoutOrder, (snapshot) => mapAndSort(snapshot));
          return;
        }
        console.error("Failed to subscribe employee ledger:", error);
      }
    );

    return () => {
      unsubscribePrimary();
      if (unsubscribeFallback) unsubscribeFallback();
    };
  }
};
