"use client";

import { useState } from "react";
import { Calendar, Layers, Hash, Loader2, Save, X, Banknote } from "lucide-react";
import { Employee, WorkerRole, ROLE_RATES } from "@/types";
import { labourService } from "@/services/labourService";

interface WorkEntryFormProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

const ARTICLE_OPTIONS = ["T-shirt", "Nikar", "Nikar Suit", "Track Suit"] as const;

export const WorkEntryForm = ({ employee, onClose, onSuccess }: WorkEntryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const day = today.getDay(); // Sunday = 0
    const daysFromMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: saturday.toISOString().split('T')[0],
      article: ARTICLE_OPTIONS[0],
      color: "",
      pieces: "",
      role: employee.role as WorkerRole,
      rate: (employee.pieceRate ?? ROLE_RATES[employee.role] ?? 0).toString()
    };
  });

  const handleRoleChange = (newRole: WorkerRole) => {
    setFormData({
      ...formData,
      role: newRole,
      rate: (employee.pieceRate ?? ROLE_RATES[newRole] ?? 0).toString()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.article.trim()) return alert("Please enter article (e.g. T-shirt, Nikar)");
    if (!formData.color.trim()) return alert("Please enter color");
    const piecesNum = parseFloat(formData.pieces);
    const rateNum = parseFloat(formData.rate);
    if (!piecesNum || piecesNum <= 0) return alert("Please enter pieces");
    if (!rateNum || rateNum < 0) return alert("Please enter a valid rate");

    setLoading(true);
    try {
      // Modified labourService.addWeeklyWork will be needed to accept custom rate
      await labourService.addWeeklyWork(
        employee.id,
        new Date(formData.startDate),
        new Date(formData.endDate),
        formData.article.trim(),
        formData.color.trim(),
        piecesNum,
        formData.role,
        rateNum
      );
      onSuccess();
    } catch (error) {
      console.error("Error adding work:", error);
      alert("Failed to save work entry.");
    } finally {
      setLoading(false);
    }
  };

  const currentRate = parseFloat(formData.rate) || 0;
  const estimatedEarning = (parseFloat(formData.pieces) || 0) * currentRate;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white p-10 rounded-[40px] shadow-2xl animate-fade-in ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add Weekly Work</h2>
            <p className="text-sm text-slate-500 mt-1">Record pieces for {employee.name}</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="date" 
                  required
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="date" 
                  required
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Worker Role / Operation</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select 
                className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                value={formData.role}
                onChange={e => handleRoleChange(e.target.value as WorkerRole)}
              >
                {Object.keys(ROLE_RATES).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Article</label>
              <select
                required
                className="input-field py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                value={formData.article}
                onChange={(e) => setFormData({ ...formData, article: e.target.value })}
              >
                {ARTICLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Color</label>
              <input
                required
                placeholder="Black / Blue / Mixed"
                className="input-field py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Pieces Completed</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="number" 
                  required
                  placeholder="Total pieces..."
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 font-bold"
                  value={formData.pieces}
                  onChange={e => setFormData({...formData, pieces: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Rate per Piece</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="number" 
                  required
                  placeholder="Rate..."
                  className="input-field pl-12 py-3 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 font-bold"
                  value={formData.rate}
                  onChange={e => setFormData({...formData, rate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Rate</p>
                <p className="text-lg font-bold">PKR {currentRate}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Earning</p>
                <p className="text-2xl font-bold text-blue-400">PKR {estimatedEarning.toLocaleString('en-PK')}</p>
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <Save size={20} />
                <span className="text-lg">Save Work Log</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
