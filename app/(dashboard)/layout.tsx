// src/app/(dashboard)/layout.tsx
import DashboardSidebar from "@/components/shared/dashboard-sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen bg-slate-50 dark:bg-[#09090B]">
      {/* Sidebar - Minimal & Fixed */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64">
        <div className="p-8 md:p-12">
          {children}
        </div>
      </main>
    </section>
  );
}
