import DashboardSidebar from "@/components/shared/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen bg-slate-50 dark:bg-[#09090B]">
      {/* Sidebar - Handles its own responsive width */}
      <DashboardSidebar />

      {/* Main Content Area - Padding adjusts to match sidebar width */}
      {/* pl-16 prevents mobile content from hiding under the slim sidebar */}
      {/* md:pl-64 pushes content over for the full desktop sidebar */}
      <main className="flex-1 flex flex-col pl-8 sm:pl-32 md:pl-48 xl:pl-64 transition-all duration-300 ">
        <div className=" pl-6 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </section>
  );
}