"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Loader2, Pencil, Trash2, X } from "lucide-react";
import { customerService } from "@/services/customerService";
import { stockService } from "@/services/stockService";
import { ProductType, StockEntry, Customer } from "@/types";
import { formatDate } from "@/utils/format";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";

const PRODUCT_TABS: ProductType[] = ["T-shirt", "Nikar Suit", "Track Suit"];

type RunningStockEntry = StockEntry & { runningPieces: number };

const toInputDate = (date: Date) => date.toISOString().split("T")[0];

export default function StockPageContent() {
  const [activeProduct, setActiveProduct] = useState<ProductType>("T-shirt");
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIn, setSavingIn] = useState(false);
  const [savingOut, setSavingOut] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RunningStockEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RunningStockEntry | null>(null);

  const [inForm, setInForm] = useState({
    date: toInputDate(new Date()),
    color: "",
    pieces: "",
    description: "",
  });

  const [outForm, setOutForm] = useState({
    date: toInputDate(new Date()),
    color: "",
    pieces: "",
    customerName: "",
    description: "",
  });

  const [editForm, setEditForm] = useState({
    date: toInputDate(new Date()),
    color: "",
    pieces: "",
    customerName: "",
    description: "",
  });

  useEffect(() => {
    const unsub = stockService.subscribeToProductEntries(activeProduct, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return () => unsub();
  }, [activeProduct]);

  useEffect(() => {
    const unsub = customerService.subscribeToCustomers((data) => setCustomers(data));
    return () => unsub();
  }, []);

  const runningEntries = useMemo<RunningStockEntry[]>(() => {
    return entries.reduce<RunningStockEntry[]>((acc, entry, idx) => {
      const prev = idx === 0 ? 0 : acc[idx - 1].runningPieces;
      const runningPieces = prev + (entry.type === "in" ? entry.pieces : -entry.pieces);
      acc.push({ ...entry, runningPieces });
      return acc;
    }, []);
  }, [entries]);

  const currentStock = runningEntries.at(-1)?.runningPieces ?? 0;

  const handleStockIn = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pieces = Number(inForm.pieces);
    if (!inForm.color.trim() || pieces <= 0) {
      alert("Enter valid color and pieces for stock in.");
      return;
    }

    setSavingIn(true);
    try {
      await stockService.addStockIn({
        productType: activeProduct,
        color: inForm.color,
        pieces,
        date: new Date(inForm.date),
        description: inForm.description,
      });
      setInForm({ date: toInputDate(new Date()), color: "", pieces: "", description: "" });
    } catch (error) {
      console.error("Stock in failed:", error);
      alert("Failed to save stock in entry.");
    } finally {
      setSavingIn(false);
    }
  };

  const handleStockOut = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pieces = Number(outForm.pieces);
    if (!outForm.color.trim() || !outForm.customerName.trim() || pieces <= 0) {
      alert("Enter valid customer, color and pieces for sale.");
      return;
    }
    if (pieces > currentStock) {
      alert(`Not enough stock. Available: ${currentStock} pcs.`);
      return;
    }

    setSavingOut(true);
    try {
      const matchedCustomer = customers.find(
        (customer) => customer.name.trim().toLowerCase() === outForm.customerName.trim().toLowerCase()
      );
      await stockService.addStockOut({
        productType: activeProduct,
        color: outForm.color,
        pieces,
        customerId: matchedCustomer?.id,
        customerName: outForm.customerName,
        date: new Date(outForm.date),
        description: outForm.description,
      });
      setOutForm({ date: toInputDate(new Date()), color: "", pieces: "", customerName: "", description: "" });
    } catch (error) {
      console.error("Stock out failed:", error);
      alert("Failed to save stock out entry.");
    } finally {
      setSavingOut(false);
    }
  };

  const openEditModal = (entry: RunningStockEntry) => {
    setEditingEntry(entry);
    setEditForm({
      date: toInputDate(entry.date.toDate()),
      color: entry.color || "",
      pieces: String(entry.pieces || ""),
      customerName: entry.customerName || "",
      description: entry.description || "",
    });
  };

  const handleUpdateEntry = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEntry) return;

    const pieces = Number(editForm.pieces);
    if (!editForm.color.trim() || pieces <= 0) {
      alert("Enter valid color and pieces.");
      return;
    }
    if (editingEntry.type === "out" && !editForm.customerName.trim()) {
      alert("Customer name is required for stock out entries.");
      return;
    }

    setSavingEdit(true);
    try {
      const matchedCustomer =
        editingEntry.type === "out"
          ? customers.find(
              (customer) => customer.name.trim().toLowerCase() === editForm.customerName.trim().toLowerCase()
            )
          : undefined;
      await stockService.updateStockEntry(editingEntry.id, {
        type: editingEntry.type,
        color: editForm.color,
        pieces,
        date: new Date(editForm.date),
        customerId: editingEntry.type === "out" ? matchedCustomer?.id : "",
        customerName: editingEntry.type === "out" ? editForm.customerName : "",
        description: editForm.description,
      });
      setEditingEntry(null);
    } catch (error) {
      console.error("Stock update failed:", error);
      alert("Failed to update stock entry.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await stockService.deleteStockEntry(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Stock delete failed:", error);
      alert("Failed to delete stock entry.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Boxes size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stock</h1>
            <p className="text-sm text-slate-500">Track loaded and sold pieces by product and color.</p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveProduct(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              activeProduct === tab
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Current Stock</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{currentStock} pcs</p>
          <p className="text-xs text-slate-400 mt-1">{activeProduct}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        <form onSubmit={handleStockIn} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 h-full flex flex-col">
          <h3 className="text-sm font-bold text-slate-900">Stock In (Load)</h3>
          <input type="date" className="input-field py-2" value={inForm.date} onChange={(e) => setInForm({ ...inForm, date: e.target.value })} required />
          <input placeholder="Color (e.g. Pink)" className="input-field py-2" value={inForm.color} onChange={(e) => setInForm({ ...inForm, color: e.target.value })} required />
          <input type="number" min={1} placeholder="Pieces loaded" className="input-field py-2" value={inForm.pieces} onChange={(e) => setInForm({ ...inForm, pieces: e.target.value })} required />
          <input placeholder="Description (optional)" className="input-field py-2" value={inForm.description} onChange={(e) => setInForm({ ...inForm, description: e.target.value })} />
          <div className="mt-auto pt-2">
            <button disabled={savingIn} className="btn-primary w-full py-3 rounded-lg">
              {savingIn ? "Saving..." : "Add Stock In"}
            </button>
          </div>
        </form>

        <form onSubmit={handleStockOut} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 h-full flex flex-col">
          <h3 className="text-sm font-bold text-slate-900">Stock Out (Sale)</h3>
          <input type="date" className="input-field py-2" value={outForm.date} onChange={(e) => setOutForm({ ...outForm, date: e.target.value })} required />
          <input placeholder="Color sold" className="input-field py-2" value={outForm.color} onChange={(e) => setOutForm({ ...outForm, color: e.target.value })} required />
          <input type="number" min={1} placeholder="Pieces sold" className="input-field py-2" value={outForm.pieces} onChange={(e) => setOutForm({ ...outForm, pieces: e.target.value })} required />
          <input
            list="stock-customers"
            placeholder="Customer name"
            className="input-field py-2"
            value={outForm.customerName}
            onChange={(e) => setOutForm({ ...outForm, customerName: e.target.value })}
            required
          />
          <datalist id="stock-customers">
            {customers.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <input placeholder="Description (optional)" className="input-field py-2" value={outForm.description} onChange={(e) => setOutForm({ ...outForm, description: e.target.value })} />
          <div className="mt-auto pt-2">
            <button disabled={savingOut} className="btn-primary w-full py-3 rounded-lg">
              {savingOut ? "Saving..." : "Add Stock Out"}
            </button>
          </div>
        </form>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Stock Ledger</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[980px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Party</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">In</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Out</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Balance</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : runningEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 italic">
                    No stock records yet for {activeProduct}.
                  </td>
                </tr>
              ) : (
                runningEntries.map((entry) => {
                  const inPieces = entry.type === "in" ? `${entry.pieces} pcs` : "---";
                  const outPieces = entry.type === "out" ? `${entry.pieces} pcs` : "---";
                  const linkedCustomer = entry.customerId
                    ? customers.find((customer) => customer.id === entry.customerId)
                    : null;
                  let partyLabel = entry.customerName || "---";
                  if (entry.customerId) {
                    partyLabel = linkedCustomer?.name || "Deleted customer";
                  }

                  return (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-xs text-slate-600">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{entry.color}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{partyLabel}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
                      {inPieces}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-rose-600">
                      {outPieces}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{entry.runningPieces} pcs</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(entry)}
                          className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center"
                          aria-label="Edit stock entry"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(entry)}
                          className="h-8 w-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                          aria-label="Delete stock entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingEntry && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
            onClick={() => setEditingEntry(null)}
            aria-label="Close edit modal"
          />
          <form onSubmit={handleUpdateEntry} className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900">Edit Stock Entry</h3>
              <button
                type="button"
                className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                onClick={() => setEditingEntry(null)}
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="date"
              className="input-field py-2"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              required
            />
            <input
              placeholder="Color"
              className="input-field py-2"
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
              required
            />
            <input
              type="number"
              min={1}
              placeholder="Pieces"
              className="input-field py-2"
              value={editForm.pieces}
              onChange={(e) => setEditForm({ ...editForm, pieces: e.target.value })}
              required
            />
            {editingEntry.type === "out" && (
              <input
                list="stock-customers-edit"
                placeholder="Customer name"
                className="input-field py-2"
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                required
              />
            )}
            <datalist id="stock-customers-edit">
              {customers.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            <input
              placeholder="Description (optional)"
              className="input-field py-2"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="w-full py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button disabled={savingEdit} className="btn-primary w-full py-3 rounded-lg">
                {savingEdit ? "Updating..." : "Update Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteEntry}
        title="Delete Stock Entry"
        description="Are you sure you want to delete this stock entry? This will recalculate running stock balance."
      />
    </div>
  );
}
