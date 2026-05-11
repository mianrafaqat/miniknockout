"use client";

import { useState } from "react";
import { X, Save, Wallet, Loader2, AlertCircle, Calendar } from "lucide-react";
import { labourService } from "@/services/labourService";
import { Employee } from "@/types";
import { formatDateForInput } from "@/utils/format";

interface AdvanceFormModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export const AdvanceFormModal = ({ employee, isOpen, onClose }: AdvanceFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: formatDateForInput(new Date()),
    amount: "",
    description: "Advance taken for household expenses"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (!amountNum || amountNum <= 0) return alert("Enter a valid amount");

    setLoading(true);
    try {
      await labourService.recordAdvance(employee.id, amountNum, formData.description, new Date(formData.date));
      onClose();
    } catch (error) {
      console.error("Advance error:", error);
      alert("Failed to record advance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white p-8 rounded-[32px] shadow-2xl animate-fade-in ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Issue Advance</h2>
            <p className="text-sm text-slate-500 mt-1">Cash payment to {employee.name}</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider leading-relaxed">
            This will increase the worker&apos;s advance balance and will be deducted from future weekly payouts.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Advance Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="date"
                className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 text-base font-semibold"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Advance Amount (Rs.)</label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required 
                type="number"
                placeholder="0.00"
                className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 text-xl font-bold"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description / Reason</label>
            <textarea 
              rows={3}
              className="input-field py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 text-sm font-medium resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-red-100"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <Save size={20} />
                <span className="text-lg">Confirm Cash Advance</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
