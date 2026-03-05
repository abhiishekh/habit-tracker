import DashboardSidebar from "@/components/shared/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen">
      {/* Sidebar - Handles its own responsive width */}
      <DashboardSidebar />

      {/* Main Content Area - Padding adjusts to match sidebar width */}
      {/* pl-16 prevents mobile content from hiding under the slim sidebar */}
      {/* md:pl-64 pushes content over for the full desktop sidebar */}
      {/* pt-20 clears the fixed top header (16) + adds a 4 unit gap */}
      <main className="flex-1 flex flex-col pt-20 pl-16 md:pl-64 transition-all duration-300">
        <div className="pl-6 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </section>
  );
}