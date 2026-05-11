"use client";

import { X, Save, FileText, Banknote, Calendar, Loader2 } from "lucide-react";
import { LabourTransaction } from "@/types";
import { formatDateForInput } from "@/utils/format";

interface LabourTransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    description: string;
    date: Date;
    periodStart?: Date;
    periodEnd?: Date;
  }) => void;
  transaction: LabourTransaction | null;
  loading?: boolean;
}

export const LabourTransactionEditModal = ({
  isOpen,
  onClose,
  onSave,
  transaction,
  loading = false,
}: LabourTransactionEditModalProps) => {
  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const amount = Number(form.get("amount"));
    const description = String(form.get("description") || "");
    const date = String(form.get("date") || "");
    const periodStart = String(form.get("periodStart") || "");
    const periodEnd = String(form.get("periodEnd") || "");

    onSave({
      amount,
      description,
      date: new Date(date),
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white p-8 rounded-3xl shadow-2xl ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Labour Entry</h2>
            <p className="text-sm text-slate-500">Correct amount, dates, and notes.</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form key={transaction.id} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                name="description"
                className="input-field pl-12 py-3"
                defaultValue={transaction.description || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (PKR)</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="number" required name="amount" className="input-field pl-12 py-3" defaultValue={transaction.amount} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="date" required name="date" className="input-field pl-12 py-3" defaultValue={formatDateForInput(transaction.date)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Period Start</label>
              <input type="date" name="periodStart" className="input-field py-3" defaultValue={formatDateForInput(transaction.periodStart)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Period End</label>
              <input type="date" name="periodEnd" className="input-field py-3" defaultValue={formatDateForInput(transaction.periodEnd)} />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
