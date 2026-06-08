'use client';

import React, { useEffect, useState } from "react";
import { AppProvider } from "../context/AppContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileQuickAccess from "../components/MobileQuickAccess";
import ToastContainer from "../components/ToastContainer";

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gold-light animate-pulse text-lg font-display tracking-widest uppercase">
          VOLTARA...
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#050505] text-[#ECECEC] font-sans antialiased flex flex-col justify-between">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <MobileQuickAccess />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
