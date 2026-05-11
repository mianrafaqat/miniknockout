"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const NewTransactionFormContent = dynamic(
  () => import("@/components/pages/NewTransactionFormContent"),
  { 
    loading: () => (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    )
  }
);

export default function NewLedgerEntry() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-slate-900" size={40} /></div>}>
      <NewTransactionFormContent />
    </Suspense>
  );
}
