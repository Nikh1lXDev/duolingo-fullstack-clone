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
    <aside className="hidden h-full flex-col border-r-2 border-[#e5e5e5] bg-white px-4 py-6 md:flex md:w-64 lg:w-72">
      <Link href="/" className="mb-10 pl-4 transition-opacity hover:opacity-80">
        <Logo className="h-9 w-auto text-[#58cc02]" />
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
                  "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all",
                  isActive 
                    ? "bg-[#ddf4c5] text-[#1cb0f6] border-2 border-[#84d8ff]" // Duolingo style active state
                    : "text-[#777777] border-2 border-transparent hover:bg-[#f7f7f7]"
                )}
              >
                <Icon 
                  className={cn(
                    "h-8 w-8 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-[#1cb0f6]" : "text-[#afafaf]"
                  )} 
                  strokeWidth={2.5} 
                />
                <span className="hidden lg:block">{item.name}</span>
              </Link>
            );
          })
        ) : (
          <>
            <Link
              href="/login"
              className={cn(
                "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all",
                pathname === "/login" 
                  ? "bg-[#ddf4c5] text-[#1cb0f6] border-2 border-[#84d8ff]"
                  : "text-[#777777] border-2 border-transparent hover:bg-[#f7f7f7]"
              )}
            >
              <LogIn className="h-8 w-8 shrink-0 text-[#afafaf] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span className="hidden lg:block">LOG IN</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all",
                pathname === "/signup" 
                  ? "bg-[#ddf4c5] text-[#1cb0f6] border-2 border-[#84d8ff]"
                  : "text-[#777777] border-2 border-transparent hover:bg-[#f7f7f7]"
              )}
            >
              <UserPlus className="h-8 w-8 shrink-0 text-[#afafaf] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span className="hidden lg:block">SIGN UP</span>
            </Link>
          </>
        )}
      </nav>

      {isAuthenticated && (
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/settings"
            className={cn(
              "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all border-2 border-transparent hover:bg-[#f7f7f7]",
              pathname === "/settings" ? "bg-[#f7f7f7] text-[#3c3c3c]" : "text-[#777777]"
            )}
          >
            <Settings className="h-8 w-8 shrink-0 text-[#afafaf] transition-transform group-hover:rotate-90" strokeWidth={2.5} />
            <span className="hidden lg:block">SETTINGS</span>
          </Link>
          <button
            onClick={logout}
            className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all border-2 border-transparent hover:bg-[#f7f7f7] text-[#777777]"
          >
            <LogOut className="h-8 w-8 shrink-0 text-[#afafaf] transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            <span className="hidden lg:block">LOGOUT</span>
          </button>
        </div>
      )}
    </aside>
  );
}
