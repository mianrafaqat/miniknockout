"use client";

import { Customer } from "@/types";
import { formatPKR } from "@/utils/format";
import { Phone, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomerCardProps {
  customer: Customer;
}

export const CustomerCard = ({ customer }: CustomerCardProps) => {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/customers/${customer.id}`)}
      className="card p-5 flex items-center justify-between group cursor-pointer hover:border-slate-900 transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
          {customer.name[0]}
        </div>
        <div>
          <p className="font-bold text-slate-900">{customer.name}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Phone size={12} /> {customer.phone || "---"}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center gap-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Balance</p>
          <p className={`font-bold text-lg tracking-tight ${customer.currentBalance > 0 ? "text-red-600" : "text-green-600"}`}>
            Rs. {formatPKR(Math.abs(customer.currentBalance))}
          </p>
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
      </div>
    </div>
  );
};
