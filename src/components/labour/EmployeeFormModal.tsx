"use client";

import { useState } from "react";
import { X, Save, User, UserCheck, Briefcase, Wallet, Loader2 } from "lucide-react";
import { labourService } from "@/services/labourService";
import { WorkerRole, EmployeeType, ROLE_RATES } from "@/types";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeFormModal = ({ isOpen, onClose }: EmployeeFormModalProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Piece-rate" as EmployeeType,
    role: "Overlock" as WorkerRole,
    pieceRate: ROLE_RATES.Overlock.toString(),
    salaryAmount: "0"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await labourService.addEmployee({
        name: formData.name,
        type: formData.type,
        role: formData.role,
        pieceRate: formData.type === "Piece-rate" ? parseFloat(formData.pieceRate) : undefined,
        salaryAmount: formData.type === 'Salary' ? parseFloat(formData.salaryAmount) : undefined
      });
      onClose();
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add worker.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white p-10 rounded-[40px] shadow-2xl animate-fade-in ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hire New Worker</h2>
            <p className="text-sm text-slate-500 mt-1">Add a new professional to your workforce</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required 
                placeholder="Enter worker's name..."
                className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Worker Type</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as EmployeeType})}
                >
                  <option value="Piece-rate">Piece-rate</option>
                  <option value="Salary">Monthly Salary</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Assigned Role</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100"
                  value={formData.role}
                  onChange={e => {
                    const role = e.target.value as WorkerRole;
                    setFormData({
                      ...formData,
                      role,
                      pieceRate: formData.type === "Piece-rate" ? ROLE_RATES[role].toString() : formData.pieceRate,
                    });
                  }}
                >
                  {Object.keys(ROLE_RATES).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {formData.type === "Piece-rate" && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Default Rate per Piece (Rs.)</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="number"
                  required
                  placeholder="Enter piece rate..."
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                  value={formData.pieceRate}
                  onChange={e => setFormData({ ...formData, pieceRate: e.target.value })}
                />
              </div>
            </div>
          )}

          {formData.type === 'Salary' && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Monthly Salary (Rs.)</label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="number" 
                  required
                  placeholder="Enter fixed salary..."
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                  value={formData.salaryAmount}
                  onChange={e => setFormData({...formData, salaryAmount: e.target.value})}
                />
              </div>
            </div>
          )}

          <button 
            disabled={saving}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {saving ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <Save size={20} />
                <span className="text-lg">Register Worker</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
