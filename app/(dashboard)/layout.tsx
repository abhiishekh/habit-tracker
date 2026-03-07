import DashboardSidebar from "@/components/shared/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 transition-all duration-300 pt-4 lg:pl-64 pb-20 lg:pb-0">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>

  );
}