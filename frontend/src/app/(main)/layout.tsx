import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { LayoutStats } from "@/components/layout/LayoutStats";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden relative pb-20 md:pb-0 bg-[#131f24]">
          <LayoutStats />
          <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
