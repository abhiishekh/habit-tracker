import DashboardSidebar from "@/components/shared/dashboard-sidebar";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { fetchUserSubscriptionTier } from "@/app/action";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const { plan } = await fetchUserSubscriptionTier();
  const isPro = plan === "pro";

  return (
    <div className="flex flex-1 min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 transition-all duration-300 lg:pl-[256px]">
        <DashboardHeader isPro={isPro} />
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}