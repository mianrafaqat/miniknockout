"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Phone, 
  Loader2, 
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { customerService } from "@/services/customerService";
import { Customer, Transaction } from "@/types";
import { formatPKR } from "@/utils/format";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionEditModal } from "@/components/modals/TransactionEditModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";

export default function CustomerDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsubCustomer = customerService.subscribeToCustomer(id, (data) => {
      if (data) {
        setCustomer(data);
      } else {
        router.push("/customers");
      }
    });

    const unsubTrans = customerService.subscribeToTransactions(id, (data) => {
      // Calculate Running Balances
      let currentRunningBalance = customer?.initialBalance || 0;
      const historyWithBalance = data.map((t) => {
        if (t.type === "sale") {
          currentRunningBalance += t.amount;
        } else {
          currentRunningBalance -= t.amount;
        }
        return { ...t, runningBalance: currentRunningBalance };
      });
      
      setTransactions([...historyWithBalance].reverse());
      setLoading(false);
    });

    return () => {
      unsubCustomer();
      unsubTrans();
    };
  }, [id, router, customer?.initialBalance]);

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    setProcessing(true);
    try {
      await customerService.deleteTransaction(
        id, 
        transactionToDelete.id, 
        transactionToDelete.amount, 
        transactionToDelete.type,
        transactionToDelete.stockEntryId,
        transactionToDelete.description,
        transactionToDelete.date
      );
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete entry.");
    } finally {
      setProcessing(false);
    }
  };

  const handleEditSave = async (data: { amount: number, description: string, date: Date }) => {
    if (!editingTransaction) return;
    setProcessing(true);
    try {
      await customerService.updateTransaction(
        id,
        editingTransaction.id,
        editingTransaction.amount,
        data.amount,
        editingTransaction.type,
        data.description,
        data.date
      );
      setIsEditModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update entry.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !customer) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    );
  }

  const totalDebit = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const totalCredit = transactions.filter(t => t.type === 'payment').reduce((acc, t) => acc + t.amount, 0);

  return (
    <>
      <div className="space-y-8 pb-32 animate-fade-in">
        <header className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/customers")}
              className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{customer?.name}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Phone size={10} /> {customer?.phone || "---"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all rounded-xl text-xs font-bold">
              Print Ledger
            </button>
            <button className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-slate-900 text-white p-6 md:col-span-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Current Balance</p>
            <h2 className="text-3xl font-bold tracking-tight">
              PKR {formatPKR(Math.abs(customer?.currentBalance || 0))}
            </h2>
            <p className="text-[10px] font-bold uppercase mt-2 text-slate-400">
              Status: {(customer?.currentBalance || 0) >= 0 ? "Receivable (Dr)" : "Payable (Cr)"}
            </p>
          </div>
          <div className="card p-6 border-slate-100 flex flex-col justify-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Debit (Sales)</p>
            <p className="text-xl font-bold text-slate-900">PKR {formatPKR(totalDebit)}</p>
          </div>
          <div className="card p-6 border-slate-100 flex flex-col justify-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Credit (Paid)</p>
            <p className="text-xl font-bold text-slate-900">PKR {formatPKR(totalCredit)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Ledger History</h3>
          <TransactionTable 
            transactions={transactions}
            onEdit={(t) => { setEditingTransaction(t); setIsEditModalOpen(true); }}
            onDelete={(t) => { setTransactionToDelete(t); setIsDeleteModalOpen(true); }}
          />
        </div>
      </div>

      <TransactionEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        transaction={editingTransaction}
        loading={processing}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={processing}
      />

      <Link 
        href={`/ledger/new?customerId=${customer?.id}&customerName=${encodeURIComponent(customer?.name || "")}`}
        className="fixed bottom-24 right-8 h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all z-[9998] shadow-slate-300"
      >
        <Plus size={24} />
      </Link>
    </>
  );
}
