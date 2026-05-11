"use client";

import { LabourTransaction } from "@/types";
import { formatDate, formatPKR } from "@/utils/format";
import { Edit2, Trash2 } from "lucide-react";

interface LabourLedgerTableProps {
  entries: LabourTransaction[];
  onEdit: (entry: LabourTransaction) => void;
  onDelete: (entry: LabourTransaction) => void;
}

const getSignedAmount = (entry: LabourTransaction): number => {
  if (entry.type === "Earning") return entry.amount;
  if (entry.type === "Final Payout") {
    const parsedDeduction =
      entry.adjustedAdvance ??
      Number(entry.description.match(/after PKR\s+([\d,]+)\s+deduction/i)?.[1]?.replaceAll(",", "") || 0);
    return -(entry.amount + parsedDeduction);
  }
  if (entry.type === "Advance Deduction") return 0;
  return -entry.amount;
};

const getTypePriority = (type: LabourTransaction["type"]): number => {
  switch (type) {
    case "Earning":
      return 0;
    case "Advance Taken":
      return 1;
    case "Advance Deduction":
      return 2;
    case "Final Payout":
      return 3;
    default:
      return 9;
  }
};

export const LabourLedgerTable = ({ entries, onEdit, onDelete }: LabourLedgerTableProps) => {
  const rows = [...entries]
    .sort((a, b) => {
      const aEffective = (a.periodEnd ?? a.date)?.toMillis?.() ?? 0;
      const bEffective = (b.periodEnd ?? b.date)?.toMillis?.() ?? 0;
      if (aEffective !== bEffective) return aEffective - bEffective;
      return getTypePriority(a.type) - getTypePriority(b.type);
    })
    .reduce<Array<LabourTransaction & { grossIncome: number }>>((acc, entry, idx) => {
      const prev = idx === 0 ? 0 : acc[idx - 1].runningBalance || 0;
      const prevGross = idx === 0 ? 0 : acc[idx - 1].grossIncome || 0;
      const grossIncome = prevGross + (entry.type === "Earning" ? entry.amount : 0);
      const runningBalance = prev + getSignedAmount(entry);
      acc.push({ ...entry, runningBalance, grossIncome });
      return acc;
    }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1280px] text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Period</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Particulars</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Debit (Dr)</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Credit (Cr)</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Gross Income</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Balance</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400 italic">
                No labour ledger records yet.
              </td>
            </tr>
          ) : (
            rows.map((entry) => {
              const paymentSigned = getSignedAmount(entry);
              const periodText =
                entry.periodStart && entry.periodEnd
                  ? `${formatDate(entry.periodStart)} to ${formatDate(entry.periodEnd)}`
                  : formatDate(entry.date);
              return (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-600">{periodText}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{entry.type}</p>
                    <p className="text-xs text-slate-500">{entry.description}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
                    {paymentSigned > 0 ? `PKR ${formatPKR(paymentSigned)}` : "---"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-rose-600">
                    {paymentSigned < 0 ? `PKR ${formatPKR(Math.abs(paymentSigned))}` : "---"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-blue-700">
                    PKR {formatPKR(entry.grossIncome || 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    PKR {formatPKR(entry.runningBalance || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(entry)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDelete(entry)} className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
