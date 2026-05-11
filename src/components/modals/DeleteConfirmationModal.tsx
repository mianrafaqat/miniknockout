"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this entry? This action cannot be undone and the customer's balance will be adjusted automatically."
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white p-8 rounded-[32px] shadow-2xl animate-fade-in ring-1 ring-slate-100 overflow-hidden text-center">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {description}
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg shadow-red-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Yes, Delete Entry"}
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
