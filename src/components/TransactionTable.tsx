"use client";

import { Transaction } from "@/types";
import { formatDate, formatPKR } from "@/utils/format";
import { Edit2, Trash2 } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const TransactionTable = ({ transactions, onEdit, onDelete }: TransactionTableProps) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Particulars</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Debit (Dr)</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Credit (Cr)</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Balance</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-sm italic">
                No records found for this customer.
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  {formatDate(t.date)}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{t.description || (t.type === 'sale' ? 'Sale' : 'Payment')}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  {t.type === 'sale' ? (
                    <span className="text-sm font-bold text-red-600">PKR {formatPKR(t.amount)}</span>
                  ) : "---"}
                </td>
                <td className="px-6 py-4 text-right">
                  {t.type === 'payment' ? (
                    <span className="text-sm font-bold text-green-600">PKR {formatPKR(t.amount)}</span>
                  ) : "---"}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">
                  PKR {formatPKR(t.runningBalance || 0)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(t)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
