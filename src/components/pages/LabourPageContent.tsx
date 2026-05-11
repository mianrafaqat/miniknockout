"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Users, Briefcase, TrendingUp, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmployeeCard } from "@/components/labour/EmployeeCard";
import { labourService } from "@/services/labourService";
import { Employee } from "@/types";
import { formatPKR } from "@/utils/format";
import { EmployeeFormModal } from "@/components/labour/EmployeeFormModal";

export default function LabourPageContent() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = labourService.subscribeToEmployees((data) => {
      setEmployees(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAdvance = employees.reduce((acc, e) => acc + e.advanceBalance, 0);

  return (
    <>
      <div className="space-y-8 pb-32 animate-fade-in">
        <header className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workforce</h1>
              <p className="text-sm text-slate-500">Managing {employees.length} skilled workers</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEmployeeModalOpen(true)}
            className="h-12 px-6 bg-slate-900 text-white rounded-2xl flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 font-bold"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Worker</span>
          </button>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-6 bg-white border-slate-50 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Workforce</p>
                <p className="text-2xl font-black text-slate-900">{employees.length}</p>
              </div>
            </div>
            <TrendingUp size={24} className="text-slate-100 group-hover:text-blue-200 transition-colors" />
          </div>
          <div className="card p-6 bg-white border-slate-50 shadow-sm flex items-center justify-between group hover:border-red-500 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Advance Debt</p>
                <p className="text-2xl font-black text-slate-900">Rs. {formatPKR(totalAdvance)}</p>
              </div>
            </div>
            <TrendingUp size={24} className="text-slate-100 group-hover:text-red-200 transition-colors rotate-90" />
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search workers by name..." 
            className="input-field pl-14 py-4.5 bg-white border-slate-100 shadow-sm focus:ring-slate-900 focus:border-slate-900 text-lg" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Workers</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
              A-Z Sorted
            </span>
          </div>
          
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="animate-spin mx-auto text-slate-900" size={32} />
              <p className="text-sm text-slate-400 mt-4 font-medium tracking-tight">Loading workforce data...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="card py-24 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-[32px]">
              <div className="h-16 w-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} />
              </div>
              <p className="text-slate-400 font-medium">
                {searchQuery ? "No workers matching your search." : "Your worker list is currently empty."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredEmployees.map((e) => (
                <EmployeeCard 
                  key={e.id} 
                  employee={e} 
                  onClick={() => router.push(`/labour/${e.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EmployeeFormModal 
        isOpen={isEmployeeModalOpen} 
        onClose={() => setIsEmployeeModalOpen(false)} 
      />
    </>
  );
}
