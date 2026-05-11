"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import type { Timestamp } from "firebase/firestore";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { ArrowUpRight, ArrowDownLeft, Plus, Users, Loader2, Building2, ReceiptText, Wallet } from "lucide-react";
import Link from "next/link";
import { formatPKR } from "@/utils/format";

type RecentTransaction = {
  id: string;
  customerName: string;
  description?: string;
  type: "sale" | "payment";
  amount: number;
  date?: Timestamp;
};

export default function Home() {
  const [stats, setStats] = useState({ receivable: 0, payable: 0 });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCustomers = onSnapshot(collection(db, "customers"), (snapshot) => {
      let rec = 0;
      let pay = 0;
      snapshot.docs.forEach(doc => {
        const bal = doc.data().currentBalance || 0;
        if (bal > 0) rec += bal;
        else pay += Math.abs(bal);
      });
      setStats({ receivable: rec, payable: pay });
    });

    const q = query(collection(db, "transactions"), orderBy("date", "desc"), limit(5));
    const unsubTrans = onSnapshot(q, (snapshot) => {
      setRecentTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RecentTransaction)));
      setLoading(false);
    });

    return () => {
      unsubCustomers();
      unsubTrans();
    };
  }, []);

  const netPosition = stats.receivable - stats.payable;
  const activeParties = recentTransactions.length;

  return (
    <div className="space-y-7 pb-10 animate-fade-in">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">miniKnockout</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Business Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Live summary of receivables, payables, and transaction movement.</p>
          </div>
          <div className="hidden h-11 w-11 shrink-0 rounded-xl bg-slate-900 text-white md:flex items-center justify-center">
            <Building2 size={20} />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-100">Total Receivable</p>
            <ArrowUpRight size={18} className="text-emerald-100" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight">PKR {formatPKR(stats.receivable)}</p>
          <p className="mt-1 text-xs text-emerald-100">Outstanding sales from customers</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Payable</p>
            <ArrowDownLeft size={18} className="text-slate-500" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">PKR {formatPKR(stats.payable)}</p>
          <p className="mt-1 text-xs text-slate-500">Liability currently owed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Net Position</p>
            <Wallet size={18} className="text-slate-500" />
          </div>
          <p className={`mt-3 text-3xl font-bold tracking-tight ${netPosition >= 0 ? "text-emerald-700" : "text-red-600"}`}>
            PKR {formatPKR(Math.abs(netPosition))}
          </p>
          <p className="mt-1 text-xs text-slate-500">{netPosition >= 0 ? "Positive cash exposure" : "Negative cash exposure"}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/ledger/new"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Plus size={19} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Add New Entry</p>
              <p className="text-xs text-slate-500">Create sale or payment record</p>
            </div>
          </div>
        </Link>

        <Link
          href="/customers"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users size={19} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Manage Customers</p>
              <p className="text-xs text-slate-500">Open customer balances and profiles</p>
            </div>
          </div>
        </Link>

        <Link
          href="/ledger"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ReceiptText size={19} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Open Full Ledger</p>
              <p className="text-xs text-slate-500">Review complete transaction history</p>
            </div>
          </div>
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.18em]">Recent Transactions</h2>
            <p className="text-xs text-slate-500 mt-1">{activeParties} entries in latest activity stream</p>
          </div>
          <Link href="/ledger" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
            View All
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-900" /></div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No transactions yet</div>
          ) : (
            recentTransactions.map((t) => {
              const isSale = t.type === "sale";
              const toneClasses = isSale ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700";
              const amountClasses = isSale ? "text-rose-600" : "text-emerald-700";
              const amountPrefix = isSale ? "+" : "-";

              return (
              <div key={t.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${toneClasses}`}>
                    {isSale ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.customerName}</p>
                    <p className="text-xs text-slate-500">{t.description || t.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${amountClasses}`}>
                    {amountPrefix} PKR {formatPKR(t.amount)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {t.date?.toDate().toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            );
            })
          )}
        </div>
      </section>
    </div>
  );
}



