"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  History, 
  MoreVertical
} from "lucide-react";
import { labourService } from "@/services/labourService";
import { Employee, LabourTransaction } from "@/types";
import { formatPKR } from "@/utils/format";
import { PayrollSummary } from "@/components/labour/PayrollSummary";
import { AdvanceFormModal } from "@/components/labour/AdvanceFormModal";
import { WorkEntryForm } from "@/components/labour/WorkEntryForm";
import { LabourLedgerTable } from "@/components/labour/LabourLedgerTable";
import { LabourTransactionEditModal } from "@/components/labour/LabourTransactionEditModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EmployeeDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [ledger, setLedger] = useState<LabourTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LabourTransaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<LabourTransaction | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const unsubEmployee = onSnapshot(doc(db, "employees", id), (doc) => {
      if (doc.exists()) {
        setEmployee({ id: doc.id, ...doc.data() } as Employee);
      } else {
        router.push("/labour");
      }
    });

    const unsubLedger = labourService.subscribeToEmployeeLedger(id, (data) => {
      setLedger(data);
      setLoading(false);
    });

    return () => {
      unsubEmployee();
      unsubLedger();
    };
  }, [id, router]);

  useEffect(() => {
    if (!employee || !id) return;
    if (ledger.length !== 0) return;
    if ((employee.advanceBalance || 0) === 0) return;

    labourService.reconcileAdvanceBalance(id).catch((error) => {
      console.error("Failed to reconcile advance balance:", error);
    });
  }, [employee, id, ledger.length]);

  if (loading && !employee) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    );
  }

  const totalEarnings = ledger.filter(t => t.type === 'Earning').reduce((acc, t) => acc + t.amount, 0);
  const totalAdvances = ledger.filter(t => t.type === 'Advance Taken').reduce((acc, t) => acc + t.amount, 0);
  const currentPayable = ledger.reduce((acc, entry) => {
    if (entry.type === "Earning") return acc + entry.amount;
    if (entry.type === "Final Payout") {
      const parsedDeduction =
        entry.adjustedAdvance ??
        Number(entry.description.match(/after PKR\s+([\d,]+)\s+deduction/i)?.[1]?.replaceAll(",", "") || 0);
      return acc - (entry.amount + parsedDeduction);
    }
    if (entry.type === "Advance Deduction") return acc;
    return acc - entry.amount;
  }, 0);
  const weeklySuggestedEarning = ledger
    .filter((t) => {
      if (t.type !== "Earning") return false;
      const txDate = t.date?.toDate?.();
      if (!txDate) return false;
      const today = new Date();
      const day = today.getDay();
      const daysFromMonday = day === 0 ? 6 : day - 1;
      const monday = new Date(today);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(today.getDate() - daysFromMonday);
      const saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5);
      saturday.setHours(23, 59, 59, 999);
      return txDate >= monday && txDate <= saturday;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const handleEditSave = async (data: {
    amount: number;
    description: string;
    date: Date;
    periodStart?: Date;
    periodEnd?: Date;
  }) => {
    if (!editingEntry || !employee) return;
    setProcessing(true);
    try {
      await labourService.updateLedgerEntry(employee.id, editingEntry.id, editingEntry, data);
      setIsEditModalOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error updating labour entry:", error);
      alert("Failed to update entry.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete || !employee) return;
    setProcessing(true);
    try {
      await labourService.deleteLedgerEntry(employee.id, entryToDelete);
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error("Error deleting labour entry:", error);
      alert("Failed to delete entry.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="space-y-8 pb-32 animate-fade-in">
        <header className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/labour")}
              className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{employee?.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {employee?.role}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  employee?.type === 'Piece-rate' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                }`}>
                  {employee?.type}
                </span>
                {employee?.type === "Piece-rate" && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Rate PKR {formatPKR(employee?.pieceRate || 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <MoreVertical size={18} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-slate-900 text-white p-6 shadow-xl shadow-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Active Advance</p>
            <h2 className="text-3xl font-black text-red-400">
              PKR {formatPKR(employee?.advanceBalance || 0)}
            </h2>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setIsAdvanceModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all"
              >
                <Plus size={12} /> Issue Advance
              </button>
              <button 
                onClick={() => setIsWorkModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase bg-blue-600 hover:bg-blue-500 py-3 rounded-xl transition-all"
              >
                <Plus size={12} /> Add Work
              </button>
            </div>
          </div>
          <div className="card p-6 border-slate-100 flex flex-col justify-center bg-white">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Earnings</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">PKR {formatPKR(totalEarnings)}</p>
          </div>
          <div className="card p-6 border-slate-100 flex flex-col justify-center bg-white">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Advances</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">PKR {formatPKR(totalAdvances)}</p>
          </div>
        </div>

        {employee && (
          <PayrollSummary 
            employee={employee} 
            suggestedWeeklyEarning={weeklySuggestedEarning}
            currentPayable={Math.max(currentPayable, 0)}
            onSuccess={() => alert("Payout processed successfully!")}
          />
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History size={16} /> Labour Ledger
          </h3>
          <LabourLedgerTable
            entries={ledger}
            onEdit={(entry) => {
              setEditingEntry(entry);
              setIsEditModalOpen(true);
            }}
            onDelete={(entry) => {
              setEntryToDelete(entry);
              setIsDeleteModalOpen(true);
            }}
          />
        </div>
      </div>

      {isAdvanceModalOpen && employee && (
        <AdvanceFormModal 
          employee={employee}
          isOpen={isAdvanceModalOpen}
          onClose={() => setIsAdvanceModalOpen(false)}
        />
      )}
      {isWorkModalOpen && employee && (
        <WorkEntryForm 
          employee={employee}
          onClose={() => setIsWorkModalOpen(false)}
          onSuccess={() => {
            setIsWorkModalOpen(false);
            alert("Work log saved successfully!");
          }}
        />
      )}

      <LabourTransactionEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        transaction={editingEntry}
        loading={processing}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={processing}
        title="Delete Labour Entry"
        description="Are you sure you want to delete this labour entry? Related balances will be adjusted automatically for advance records."
      />
    </>
  );
}
