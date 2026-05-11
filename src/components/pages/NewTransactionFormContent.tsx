"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, User, FileText, Banknote, ShoppingBag, CreditCard, Calendar } from "lucide-react";
import { customerService } from "@/services/customerService";
import { stockService } from "@/services/stockService";
import { ProductType } from "@/types";

const PRODUCT_OPTIONS: ProductType[] = ["T-shirt", "Nikar Suit", "Track Suit"];

export default function NewTransactionFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get("customerId");
  const preSelectedName = searchParams.get("customerName");

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    customerId: preSelectedId || "",
    amount: "",
    type: "sale" as 'sale' | 'payment', 
    description: "",
    date: new Date().toISOString().split('T')[0],
    productType: "T-shirt" as ProductType,
    color: "",
    pieces: "",
    ratePerPiece: "",
  });

  useEffect(() => {
    const unsubscribe = customerService.subscribeToCustomers((data) => {
      setCustomers(data.map(c => ({ id: c.id, name: c.name })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return alert("Please select a customer");
    if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Please enter a valid amount");
    if (formData.type === "sale") {
      if (!formData.color.trim()) return alert("Please enter color for sold stock.");
      if (!formData.pieces || Number(formData.pieces) <= 0) return alert("Please enter pieces sold.");
    }
    
    setLoading(true);
    let createdStockEntryId = "";
    try {
      const selectedCustomer = customers.find((c) => c.id === formData.customerId);
      const selectedCustomerName = preSelectedName || selectedCustomer?.name || "";
      const manualDescription = formData.description.trim();
      const saleDescription =
        formData.type === "sale"
          ? `${formData.productType} (${formData.color}) - ${formData.pieces} pcs${formData.ratePerPiece ? ` @ PKR ${formData.ratePerPiece}` : ""}${manualDescription ? ` | ${manualDescription}` : ""}`
          : formData.description;

      if (formData.type === "sale") {
        createdStockEntryId = await stockService.addStockOut({
          productType: formData.productType,
          color: formData.color,
          pieces: Number(formData.pieces),
          customerId: formData.customerId,
          customerName: selectedCustomerName || "Walk-in Customer",
          date: new Date(formData.date),
          description: saleDescription,
        });
      }

      await customerService.addTransaction(
        formData.customerId,
        parseFloat(formData.amount),
        formData.type,
        saleDescription,
        new Date(formData.date),
        createdStockEntryId
      );
      router.push(`/customers/${formData.customerId}`);
    } catch (error) {
      if (createdStockEntryId) {
        try {
          await stockService.deleteStockEntry(createdStockEntryId);
        } catch (rollbackError) {
          console.error("Failed to rollback stock entry:", rollbackError);
        }
      }
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <header className="flex items-center gap-4 pt-4">
        <button onClick={() => router.back()} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Entry</h1>
          <p className="text-sm text-slate-500">Add a transaction to the ledger</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Party / Customer</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            {preSelectedId ? (
              <div className="input-field pl-12 bg-slate-50 text-slate-900 font-bold flex items-center">
                {preSelectedName}
              </div>
            ) : (
              <select
                required
                className="input-field pl-12 appearance-none bg-white font-bold text-slate-900"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">Select a party...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Entry Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "sale" })}
              className={`py-6 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                formData.type === "sale" 
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <ShoppingBag size={24} />
              <span className="text-sm font-bold">Debit (Sale)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "payment" })}
              className={`py-6 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                formData.type === "payment" 
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <CreditCard size={24} />
              <span className="text-sm font-bold">Credit (Payment)</span>
            </button>
          </div>
        </div>

        {formData.type === "sale" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Product</label>
              <select
                className="input-field py-4 font-bold text-slate-900"
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType })}
              >
                {PRODUCT_OPTIONS.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Color</label>
              <input
                required
                type="text"
                placeholder="Pink / Black"
                className="input-field py-4 font-bold text-slate-900"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Pieces Sold</label>
              <input
                required
                type="number"
                min={1}
                placeholder="0"
                className="input-field py-4 font-bold text-slate-900"
                value={formData.pieces}
                onChange={(e) => {
                  const pieces = e.target.value;
                  const rate = Number(formData.ratePerPiece);
                  const parsedPieces = Number(pieces);
                  setFormData({
                    ...formData,
                    pieces,
                    amount: rate > 0 && parsedPieces > 0 ? String(parsedPieces * rate) : formData.amount,
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Rate / Piece (PKR)</label>
              <input
                type="number"
                min={0}
                placeholder="Optional"
                className="input-field py-4 font-bold text-slate-900"
                value={formData.ratePerPiece}
                onChange={(e) => {
                  const rate = e.target.value;
                  const parsedRate = Number(rate);
                  const pieces = Number(formData.pieces);
                  setFormData({
                    ...formData,
                    ratePerPiece: rate,
                    amount: parsedRate > 0 && pieces > 0 ? String(pieces * parsedRate) : formData.amount,
                  });
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Amount (PKR)</label>
            <div className="relative">
              <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="number" 
                placeholder="0.00" 
                className="input-field pl-12 py-4 text-xl font-bold text-slate-900"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Entry Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="date" 
                className="input-field pl-12 py-4 font-bold text-slate-900"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Description</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea 
              rows={3}
              placeholder="Transaction details..." 
              className="input-field pl-12 pt-3 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:opacity-50 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {loading ? "Saving..." : "Confirm Entry"}
        </button>
      </form>
    </div>
  );
}
