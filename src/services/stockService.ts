import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductType, StockEntry } from "@/types";

export const stockService = {
  subscribeToProductEntries: (productType: ProductType, callback: (entries: StockEntry[]) => void) => {
    const withOrder = query(
      collection(db, "stockEntries"),
      where("productType", "==", productType),
      orderBy("date", "asc")
    );

    const withoutOrder = query(
      collection(db, "stockEntries"),
      where("productType", "==", productType)
    );

    const mapAndSort = (snapshot: { docs: Array<{ id: string; data: () => unknown }> }) => {
      const entries = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<StockEntry, "id">),
        }))
        .sort((a, b) => {
          const aDate = a.date?.toMillis?.() ?? 0;
          const bDate = b.date?.toMillis?.() ?? 0;
          return aDate - bDate;
        }) as StockEntry[];
      callback(entries);
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
        console.error("Failed to subscribe stock entries:", error);
      }
    );

    return () => {
      unsubscribePrimary();
      if (unsubscribeFallback) unsubscribeFallback();
    };
  },

  addStockIn: async (data: {
    productType: ProductType;
    color: string;
    pieces: number;
    date: Date;
    description?: string;
  }) => {
    const batch = writeBatch(db);
    const ref = doc(collection(db, "stockEntries"));
    batch.set(ref, {
      productType: data.productType,
      type: "in",
      color: data.color.trim(),
      pieces: data.pieces,
      date: Timestamp.fromDate(data.date),
      description: data.description?.trim() || "Stock loaded",
      createdAt: Timestamp.now(),
    });
    await batch.commit();
  },

  addStockOut: async (data: {
    productType: ProductType;
    color: string;
    pieces: number;
    customerId?: string;
    customerName: string;
    date: Date;
    description?: string;
  }) => {
    const batch = writeBatch(db);
    const ref = doc(collection(db, "stockEntries"));
    batch.set(ref, {
      productType: data.productType,
      type: "out",
      color: data.color.trim(),
      pieces: data.pieces,
      customerId: data.customerId || "",
      customerName: data.customerName.trim(),
      date: Timestamp.fromDate(data.date),
      description: data.description?.trim() || `Sold to ${data.customerName.trim()}`,
      createdAt: Timestamp.now(),
    });
    await batch.commit();
    return ref.id;
  },

  updateStockEntry: async (
    entryId: string,
    data: {
      type: "in" | "out";
      color: string;
      pieces: number;
      date: Date;
      description?: string;
      customerId?: string;
      customerName?: string;
    }
  ) => {
    const ref = doc(db, "stockEntries", entryId);
    await updateDoc(ref, {
      color: data.color.trim(),
      pieces: data.pieces,
      date: Timestamp.fromDate(data.date),
      description: data.description?.trim() || (data.type === "in" ? "Stock loaded" : `Sold to ${data.customerName?.trim() || "Customer"}`),
      customerId: data.type === "out" ? data.customerId || "" : "",
      customerName: data.type === "out" ? data.customerName?.trim() || "" : "",
    });
  },

  deleteStockEntry: async (entryId: string) => {
    const ref = doc(db, "stockEntries", entryId);
    await deleteDoc(ref);
  },
};
