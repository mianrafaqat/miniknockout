"use client";

import { X, Save, FileText, Banknote, Calendar, Loader2 } from "lucide-react";
import { Transaction } from "@/types";
import { formatDateForInput } from "@/utils/format";

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { amount: number, description: string, date: Date }) => void;
  transaction: Transaction | null;
  loading?: boolean;
}

export const TransactionEditModal = ({ isOpen, onClose, onSave, transaction, loading = false }: TransactionEditModalProps) => {
  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const amount = Number(form.get("amount"));
    const description = String(form.get("description") || "");
    const date = String(form.get("date") || "");

    onSave({
      amount,
      description,
      date: new Date(date)
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white p-10 rounded-[40px] shadow-2xl animate-fade-in ring-1 ring-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Transaction</h2>
            <p className="text-sm text-slate-500 mt-1">Modify record details for this party</p>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>
        
        <form key={transaction.id} onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Particulars (Description)</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={20} />
              <input 
                required 
                name="description"
                className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-semibold" 
                placeholder="Enter details..." 
                defaultValue={transaction.description || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (Rs.)</label>
              <div className="relative group">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input 
                  type="number" 
                  required
                  name="amount"
                  className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-semibold" 
                  placeholder="0.00" 
                  defaultValue={transaction.amount}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Entry Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input 
                  type="date" 
                  required
                  name="date"
                  className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-semibold" 
                  defaultValue={formatDateForInput(transaction.date)}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Save size={20} />
                  <span className="text-lg">Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
