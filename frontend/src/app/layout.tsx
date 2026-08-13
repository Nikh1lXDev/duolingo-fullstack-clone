import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { LayoutStats } from "@/components/layout/LayoutStats";
import { AuthProvider } from "@/context/AuthContext";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Duolingo Clone",
  description: "A fun and free way to learn a language",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} antialiased flex h-screen w-full flex-col overflow-hidden bg-white md:flex-row text-[#3c3c3c]`}>
        <AuthProvider>
          <Sidebar />
          <div className="flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden relative pb-20 md:pb-0">
            <LayoutStats />
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
              {children}
            </main>
          </div>
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
