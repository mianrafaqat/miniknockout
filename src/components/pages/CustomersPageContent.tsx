"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { CustomerCard } from "@/components/CustomerCard";
import { customerService } from "@/services/customerService";
import { Customer } from "@/types";
import { CustomerFormModal } from "@/components/modals/CustomerFormModal";

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = customerService.subscribeToCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <>
      <div className="space-y-8 pb-24 animate-fade-in">
        <header className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Directory</h1>
            <p className="text-sm text-slate-500">Manage your business contacts</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={24} />
          </button>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="input-field pl-12 py-3.5" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-slate-900" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="card py-20 text-center text-slate-400 text-sm">
              {searchQuery ? "No matching records found." : "No records found."}
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <CustomerCard key={c.id} customer={c} />
            ))
          )}
        </div>
      </div>

      <CustomerFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
