"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Circle, Clock, Truck, ShieldCheck, XCircle } from "lucide-react";

export default function OrderClientActions({ orderId, currentStatus, isAdmin, isOwner }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const statuses = ["PENDING", "PROCESSING", "COMPLETED"];
  const currentStep = statuses.indexOf(currentStatus);

  async function updateStatus(newStatus: string) {
    if (!confirm(`Move order to ${newStatus}?`)) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) router.refresh();
    else alert("Update failed");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Visual Status Stepper */}
      {currentStatus !== "CANCELLED" && (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
          <div className="flex justify-between items-start">
            {statuses.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1 relative">
                {/* Line between steps */}
                {i !== 0 && (
                  <div className={`absolute top-5 right-1/2 w-full h-1 -translate-y-1/2 z-0 ${i <= currentStep ? 'bg-blue-600' : 'bg-slate-100'}`} />
                )}
                
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                  i < currentStep ? 'bg-blue-600 border-blue-600 text-white' : 
                  i === currentStep ? 'bg-white border-blue-600 text-blue-600' : 
                  'bg-white border-slate-100 text-slate-300'
                }`}>
                  {i < currentStep ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-4 h-4 fill-current" />}
                </div>
                <span className={`mt-3 text-xs font-black tracking-widest uppercase ${i <= currentStep ? 'text-blue-600' : 'text-slate-300'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Controls Area */}
      {isAdmin && (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] p-8">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Administrator Controls</p>
          <div className="flex gap-3 flex-wrap">
            {["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].map((s) => (
              <button
                key={s}
                disabled={loading || s === currentStatus}
                onClick={() => updateStatus(s)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-30 ${
                  s === currentStatus ? 'bg-white text-slate-400 border border-slate-200' :
                  s === "CANCELLED" ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Cancel Option */}
      {isOwner && currentStatus === "PENDING" && !isAdmin && (
        <button
          onClick={() => updateStatus("CANCELLED")}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
        >
          Request Cancellation
        </button>
      )}
      
      {currentStatus === "CANCELLED" && (
        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-8 flex items-center gap-4">
          <XCircle className="w-10 h-10 text-red-600" />
          <div>
             <h3 className="font-black text-red-600 text-lg">Order Cancelled</h3>
             <p className="text-red-500 font-medium">This order is no longer active and has been removed from the delivery queue.</p>
          </div>
        </div>
      )}
    </div>
  );
}