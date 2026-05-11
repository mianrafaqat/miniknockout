"use client";

import { useState } from "react";
import { X, Save, User, Phone, Banknote, Loader2 } from "lucide-react";
import { customerService } from "@/services/customerService";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerFormModal = ({ isOpen, onClose }: CustomerFormModalProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    currentBalance: "0"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const balanceValue = parseFloat(formData.currentBalance) || 0;
      await customerService.addCustomer(formData.name, formData.phone, balanceValue);
      onClose();
      setFormData({ name: "", phone: "", currentBalance: "0" });
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white p-10 rounded-[40px] shadow-2xl animate-fade-in ring-1 ring-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Client</h2>
            <p className="text-sm text-slate-500 mt-1">Create a new entry in your business directory</p>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Full Identity</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={20} />
              <input 
                required 
                className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-semibold" 
                placeholder="Enter customer name..." 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Contact No.</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input 
                  className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-semibold" 
                  placeholder="+92 ---" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Starting Balance</label>
              <div className="relative group">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input 
                  type="number" 
                  className="input-field pl-12 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-semibold" 
                  placeholder="0.00" 
                  value={formData.currentBalance} 
                  onChange={e => setFormData({...formData, currentBalance: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={saving} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <Save size={20} />
                  <span className="text-lg">Confirm & Add Client</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
              Securely stored in Pakistan Unit Database
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
