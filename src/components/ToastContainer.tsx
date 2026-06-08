import React from "react";
import { useApp } from "../context/AppContext";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="voltara-toast-container"
      className="fixed top-18 md:top-24 right-4 z-50 flex flex-col gap-3 w-full max-w-[340px] pointer-events-none"
    >
      {toasts.map((toast) => {
        // Dynamic icons & borders based on status type
        let Icon = Info;
        let borderColor = "border-gold-dark/40 shadow-[0_4px_20px_rgba(218,154,43,0.15)]";
        let iconColor = "text-gold-light";
        let progressBg = "bg-gradient-to-r from-gold-dark to-gold-light";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          borderColor = "border-emerald-500/40 shadow-[0_4px_20px_rgba(16,185,129,0.15)]";
          iconColor = "text-emerald-400";
          progressBg = "bg-emerald-500";
        } else if (toast.type === "error") {
          Icon = XCircle;
          borderColor = "border-red-500/40 shadow-[0_4px_20px_rgba(239,68,68,0.15)]";
          iconColor = "text-red-400";
          progressBg = "bg-red-500";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          borderColor = "border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.15)]";
          iconColor = "text-amber-400";
          progressBg = "bg-amber-500";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden bg-[#0C0C0C]/95 border ${borderColor} backdrop-blur-md p-4 flex items-start gap-3 rounded-lg text-white transition-all transform duration-300 translate-x-0 animate-fade-in`}
            role="alert"
          >
            {/* Voltara Neon Status Accent Line */}
            <div className="absolute top-0 bottom-0 left-0 w-[3px]" />

            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />

            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs font-display font-medium text-gray-200 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-0.5 -mt-1 -mr-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Simulated progress timer bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
              <div 
                className={`h-full ${progressBg} animate-[shrinkWidth_3.5s_linear_forwards]`}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        );
      })}

      {/* Styled animation keyframes inside scoped style block */}
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-\[shrinkWidth_3\.5s_linear_forwards\] {
          animation: shrinkWidth 3.5s linear forwards;
        }
      `}</style>
    </div>
  );
}
