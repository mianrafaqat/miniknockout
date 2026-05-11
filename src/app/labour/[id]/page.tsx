"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const EmployeeDetailPageContent = dynamic(
  () => import("@/components/pages/EmployeeDetailPageContent"),
  { 
    loading: () => (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    )
  }
);

export default function EmployeeDetailPage() {
  return <EmployeeDetailPageContent />;
}
