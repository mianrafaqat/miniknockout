"use client";

import { useState } from "react";
import { ArrowDown, Wallet, Loader2 } from "lucide-react";
import { Employee } from "@/types";
import { labourService } from "@/services/labourService";
import { formatPKR } from "@/utils/format";

interface PayrollSummaryProps {
  employee: Employee;
  suggestedWeeklyEarning?: number;
  currentPayable?: number;
  onSuccess: () => void;
}

export const PayrollSummary = ({ employee, suggestedWeeklyEarning = 0, currentPayable = 0, onSuccess }: PayrollSummaryProps) => {
  const getDefaultWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    return {
      startDate: monday.toISOString().split("T")[0],
      endDate: saturday.toISOString().split("T")[0],
    };
  };

  const defaultWeek = getDefaultWeekRange();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    startDate: defaultWeek.startDate,
    endDate: defaultWeek.endDate,
    earning:
      employee.type === "Salary" && employee.salaryAmount
        ? (employee.salaryAmount / 4.33).toFixed(0)
        : suggestedWeeklyEarning > 0
          ? suggestedWeeklyEarning.toFixed(0)
          : "",
    deduction: "",
    paidBy: "",
    note: "",
  }));

  const earningNum = parseFloat(formData.earning) || 0;
  const deductionNum = parseFloat(formData.deduction) || 0;
  const finalPayout = earningNum - deductionNum;
  const maxAllowedCashPayout = currentPayable + (employee.advanceBalance || 0);

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (earningNum <= 0) return alert("Enter valid earning amount");
    if (deductionNum > employee.advanceBalance) return alert("Deduction cannot exceed advance balance");
    if (finalPayout < 0) return alert("Deduction cannot exceed earnings");
    if (finalPayout > maxAllowedCashPayout) {
      return alert(
        `Payout cannot exceed PKR ${formatPKR(maxAllowedCashPayout)} based on current earnings and advance state.`
      );
    }

    setLoading(true);
    try {
      await labourService.processPayout(
        employee.id,
        new Date(formData.startDate),
        new Date(formData.endDate),
        earningNum,
        deductionNum,
        finalPayout,
        employee.type === "Salary" ? "Salary earning settlement" : "Piece-rate weekly settlement",
        formData.paidBy,
        formData.note
      );
      setFormData((prev) => ({
        ...prev,
        earning: "",
        deduction: "",
        paidBy: "",
        note: "",
      }));
      onSuccess();
    } catch (error) {
      console.error("Payout error:", error);
      alert("Failed to process payout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <Wallet size={18} className="text-slate-600" />
        <h3 className="text-base font-semibold text-slate-900">Weekly Payout</h3>
      </div>

      <form onSubmit={handlePayout} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Week Start (From)</label>
            <input
              type="date"
              required
              className="input-field py-3 text-base"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Week End (To)</label>
            <input
              type="date"
              required
              className="input-field py-3 text-base"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Gross Weekly Earnings</label>
            <input 
              type="number" 
              required
              placeholder="0.00"
              className="input-field py-3 text-base"
              value={formData.earning}
              onChange={e => setFormData({...formData, earning: e.target.value})}
            />
            <p className="text-[11px] text-slate-400">Auto-filled from current week records.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Advance Deduction</label>
            <div className="relative group">
              <ArrowDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
              <input 
                type="number" 
                placeholder="0.00"
                className="input-field pl-12 py-3 text-base"
                value={formData.deduction}
                onChange={e => setFormData({...formData, deduction: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400">Max: PKR {formatPKR(employee.advanceBalance)}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, deduction: (employee.advanceBalance / 2).toFixed(0) })}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, deduction: employee.advanceBalance.toFixed(0) })}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600"
                >
                  Full
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Paid By (Admin)</label>
            <input
              type="text"
              required
              placeholder="Rafaqat"
              className="input-field py-3 text-base"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Payment Note</label>
            <input
              type="text"
              placeholder="Cash / Bank transfer / Cheque no..."
              className="input-field py-3 text-base"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-lg bg-slate-900 p-4 text-white">
          <div>
            <p className="text-xs text-slate-300">Final Amount to Pay</p>
            <p className="text-3xl font-bold">PKR {formatPKR(finalPayout)}</p>
            <p className="text-xs text-slate-300 mt-1">Net payable (after advance): PKR {formatPKR(currentPayable)}</p>
            <p className="text-xs text-slate-300">Max cash without deduction: PKR {formatPKR(maxAllowedCashPayout)}</p>
          </div>
          <div className="mt-4">
            <button 
              disabled={loading || finalPayout < 0}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="mx-auto animate-spin" size={20} /> : "Record Payout"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
