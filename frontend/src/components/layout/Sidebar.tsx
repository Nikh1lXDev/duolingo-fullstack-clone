"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Shield, Target, User, Store, Settings, LogIn, UserPlus, LogOut } from "lucide-react";
import { Logo } from "@/components/illustrations/Logo";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "LEARN", href: "/", icon: Home },
  { name: "LEADERBOARD", href: "/leaderboard", icon: Shield },
  { name: "QUESTS", href: "/quests", icon: Target },
  { name: "SHOP", href: "/shop", icon: Store },
  { name: "PROFILE", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <aside className="hidden h-full flex-col border-r-2 border-[#2b3d47] bg-[#131f24] px-4 py-6 md:flex md:w-64 lg:w-64 shrink-0">
      <Link href="/" className="mb-8 pl-4 transition-opacity hover:opacity-80 flex items-center gap-2">
        <Logo className="h-8 w-auto text-[#58cc02]" />
      </Link>
      
      <nav className="flex flex-1 flex-col gap-2">
        {isAuthenticated ? (
          navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-extrabold tracking-wider uppercase transition-all border-2",
                  isActive 
                    ? "bg-[#182830] text-[#1cb0f6] border-[#1cb0f6]/50 shadow-[0_0_12px_rgba(28,176,246,0.15)]"
                    : "text-[#afafaf] border-transparent hover:bg-[#182830] hover:text-white"
                )}
              >
                <Icon 
                  className={cn(
                    "h-7 w-7 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-[#1cb0f6]" : "text-[#afafaf]"
                  )} 
                  strokeWidth={2.5} 
                />
                <span>{item.name}</span>
              </Link>
            );
          })
        ) : (
          <>
            <Link
              href="/login"
              className={cn(
                "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-extrabold tracking-wider uppercase transition-all border-2",
                pathname === "/login" 
                  ? "bg-[#182830] text-[#1cb0f6] border-[#1cb0f6]/50"
                  : "text-[#afafaf] border-transparent hover:bg-[#182830] hover:text-white"
              )}
            >
              <LogIn className="h-7 w-7 shrink-0 text-[#afafaf] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span>LOG IN</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-extrabold tracking-wider uppercase transition-all border-2",
                pathname === "/signup" 
                  ? "bg-[#182830] text-[#1cb0f6] border-[#1cb0f6]/50"
                  : "text-[#afafaf] border-transparent hover:bg-[#182830] hover:text-white"
              )}
            >
              <UserPlus className="h-7 w-7 shrink-0 text-[#afafaf] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span>SIGN UP</span>
            </Link>
          </>
        )}
      </nav>

      {isAuthenticated && (
        <div className="mt-auto flex flex-col gap-2 border-t-2 border-[#2b3d47] pt-4">
          <Link
            href="/settings"
            className={cn(
              "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-extrabold tracking-wider uppercase transition-all border-2 border-transparent hover:bg-[#182830]",
              pathname === "/settings" ? "bg-[#182830] text-[#1cb0f6]" : "text-[#afafaf]"
            )}
          >
            <Settings className="h-7 w-7 shrink-0 text-[#afafaf] transition-transform group-hover:rotate-90" strokeWidth={2.5} />
            <span>SETTINGS</span>
          </Link>
          <button
            onClick={logout}
            className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-extrabold tracking-wider uppercase transition-all border-2 border-transparent hover:bg-[#182830] text-[#afafaf] hover:text-[#ff4b4b]"
          >
            <LogOut className="h-7 w-7 shrink-0 text-[#afafaf] transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            <span>LOGOUT</span>
          </button>
        </div>
      )}
    </aside>
  );
}
