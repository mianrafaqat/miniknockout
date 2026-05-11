import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  writeBatch, 
  increment, 
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Customer, Transaction } from "@/types";

export const customerService = {
  // --- Customer Operations ---
  
  subscribeToCustomers: (callback: (customers: Customer[]) => void) => {
    const q = query(collection(db, "customers"), orderBy("name", "asc"));
    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      callback(customers);
    });
  },

  subscribeToCustomer: (id: string, callback: (customer: Customer | null) => void) => {
    const customerRef = doc(db, "customers", id);
    return onSnapshot(customerRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Customer);
      } else {
        callback(null);
      }
    });
  },

  addCustomer: async (name: string, phone: string, initialBalance: number) => {
    return await addDoc(collection(db, "customers"), {
      name,
      phone,
      initialBalance,
      currentBalance: initialBalance,
      createdAt: serverTimestamp(),
    });
  },

  // --- Transaction Operations ---

  subscribeToTransactions: (customerId: string, callback: (transactions: Transaction[]) => void) => {
    const q = query(
      collection(db, "transactions"),
      where("customerId", "==", customerId),
      orderBy("date", "asc")
    );
    
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      callback(transactions);
    });
  },

  addTransaction: async (
    customerId: string,
    amount: number,
    type: "sale" | "payment",
    description: string,
    date: Date,
    stockEntryId?: string
  ) => {
    const batch = writeBatch(db);
    
    // 1. Create Transaction
    const transRef = doc(collection(db, "transactions"));
    batch.set(transRef, {
      customerId,
      amount,
      type,
      description,
      stockEntryId: stockEntryId || "",
      date: Timestamp.fromDate(date),
      createdAt: serverTimestamp(),
    });

    // 2. Update Customer Balance
    const balanceAdjustment = type === 'sale' ? amount : -amount;
    const customerRef = doc(db, "customers", customerId);
    batch.update(customerRef, {
      currentBalance: increment(balanceAdjustment)
    });

    return await batch.commit();
  },

  updateTransaction: async (customerId: string, transactionId: string, oldAmount: number, newAmount: number, type: 'sale' | 'payment', description: string, date: Date) => {
    const batch = writeBatch(db);
    const diff = newAmount - oldAmount;

    // 1. Update transaction
    const transRef = doc(db, "transactions", transactionId);
    batch.update(transRef, {
      amount: newAmount,
      description,
      date: Timestamp.fromDate(date)
    });

    // 2. Update customer balance if amount changed
    if (diff !== 0) {
      const balanceAdjustment = type === 'sale' ? diff : -diff;
      const customerRef = doc(db, "customers", customerId);
      batch.update(customerRef, {
        currentBalance: increment(balanceAdjustment)
      });
    }

    return await batch.commit();
  },

  deleteTransaction: async (
    customerId: string,
    transactionId: string,
    amount: number,
    type: "sale" | "payment",
    stockEntryId?: string,
    description?: string,
    date?: Timestamp
  ) => {
    const batch = writeBatch(db);
    
    // 1. Delete the transaction
    const transRef = doc(db, "transactions", transactionId);
    batch.delete(transRef);

    // 2. Adjust customer balance
    const balanceAdjustment = type === 'sale' ? -amount : amount;
    const customerRef = doc(db, "customers", customerId);
    batch.update(customerRef, {
      currentBalance: increment(balanceAdjustment)
    });

    await batch.commit();

    if (stockEntryId) {
      const stockRef = doc(db, "stockEntries", stockEntryId);
      await deleteDoc(stockRef);
      return;
    }

    // Backward compatibility: older sale entries were not linked.
    if (type === "sale" && description && date) {
      const stockOutQuery = query(collection(db, "stockEntries"), where("type", "==", "out"));
      const snapshot = await getDocs(stockOutQuery);

      const txDate = date.toDate();
      const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime();

      const candidates = snapshot.docs
        .filter((docSnap) => {
          const data = docSnap.data();
          if (data.description !== description) return false;
          if (!data.date?.toDate) return false;
          const stockDate = data.date.toDate();
          const stockDay = new Date(stockDate.getFullYear(), stockDate.getMonth(), stockDate.getDate()).getTime();
          return stockDay === txDay;
        })
        .sort((a, b) => {
          const aTime = a.data().date?.toMillis?.() ?? 0;
          const bTime = b.data().date?.toMillis?.() ?? 0;
          return bTime - aTime;
        });

      if (candidates.length > 0) {
        await deleteDoc(doc(db, "stockEntries", candidates[0].id));
      }
    }
  },

  subscribeToRecentTransactions: (limitCount: number = 50, callback: (transactions: Transaction[]) => void) => {
    const q = query(
      collection(db, "transactions"),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      callback(transactions);
    });
  }
};
