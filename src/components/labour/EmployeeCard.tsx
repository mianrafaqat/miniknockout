"use client";

import { Employee } from "@/types";
import { formatPKR } from "@/utils/format";
import { User, ChevronRight, Wallet } from "lucide-react";

interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
}

export const EmployeeCard = ({ employee, onClick }: EmployeeCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group card p-5 flex items-center justify-between bg-white border-slate-50 shadow-sm hover:border-slate-900 transition-all cursor-pointer active:scale-[0.99] relative overflow-hidden"
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold transition-transform group-hover:rotate-6 ${
          employee.type === 'Piece-rate' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
        }`}>
          <User size={28} />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{employee.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              {employee.role}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
              employee.type === 'Piece-rate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {employee.type}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              {employee.type === "Piece-rate"
                ? `PKR ${employee.pieceRate ?? 0}/pc`
                : `PKR ${employee.salaryAmount ?? 0}/mo`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5 flex items-center justify-end gap-1">
            <Wallet size={10} /> Advance
          </p>
          <p className={`font-black text-xl tracking-tighter ${employee.advanceBalance > 0 ? "text-red-600" : "text-slate-900"}`}>
            PKR {formatPKR(employee.advanceBalance)}
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
          <ChevronRight size={20} />
        </div>
      </div>
      
      {/* Subtle Background Accent */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 pointer-events-none transition-transform group-hover:scale-110">
        <User size={120} />
      </div>
    </div>
  );
};
