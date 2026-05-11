"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { customerService } from "@/services/customerService";
import { Transaction } from "@/types";
import { formatPKR, formatDate } from "@/utils/format";

export default function GlobalLedgerContent() {
  const [entries, setEntries] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = customerService.subscribeToRecentTransactions(50, (data) => {
      setEntries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredEntries = entries.filter(e => 
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction Ledger</h1>
          <p className="text-sm text-slate-500">Recent activity across all parties</p>
        </div>
        <Link href="/ledger/new" className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform">
          <Plus size={28} />
        </Link>
      </header>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="input-field pl-12 py-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-14 w-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-400 bg-white">
          <Filter size={20} />
        </button>
      </div>

      {/* Ledger List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-slate-900" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-20 text-center space-y-3 card border-dashed">
            <p className="text-slate-400">No transactions recorded yet.</p>
            <Link href="/ledger/new" className="text-slate-900 font-bold">Record your first entry</Link>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="card p-5 flex items-center justify-between hover:border-slate-900 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  entry.type === "sale" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {entry.type === "sale" ? <ShoppingBag size={24} /> : <CreditCard size={24} />}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-0.5">
                    {entry.type === "sale" ? "Debit (Sale)" : "Credit (Payment)"}
                  </p>
                  <p className="font-bold text-slate-900">{entry.description || "No description"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDate(entry.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${entry.type === "sale" ? "text-red-600" : "text-green-600"}`}>
                  PKR {formatPKR(entry.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
