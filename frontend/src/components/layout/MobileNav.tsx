"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Shield, Target, User, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Learn", href: "/learn", icon: Home },
  { name: "Leaderboard", href: "/leaderboard", icon: Shield },
  { name: "Quests", href: "/quests", icon: Target },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t-2 border-[#e5e5e5] bg-white pb-safe md:hidden">
        <Link
          href="/login"
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-1 transition-colors relative",
            pathname === "/login" ? "text-[#1cb0f6]" : "text-[#afafaf] hover:bg-[#f7f7f7]"
          )}
        >
          <LogIn className="h-7 w-7 relative z-10" strokeWidth={pathname === "/login" ? 3 : 2.5} />
        </Link>
        <Link
          href="/signup"
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-1 transition-colors relative",
            pathname === "/signup" ? "text-[#1cb0f6]" : "text-[#afafaf] hover:bg-[#f7f7f7]"
          )}
        >
          <UserPlus className="h-7 w-7 relative z-10" strokeWidth={pathname === "/signup" ? 3 : 2.5} />
        </Link>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t-2 border-[#e5e5e5] bg-white pb-safe md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-1 transition-colors relative",
              isActive ? "text-[#1cb0f6]" : "text-[#afafaf] hover:bg-[#f7f7f7]"
            )}
            aria-label={item.name}
          >
            <div className={cn(
              "absolute inset-1 rounded-xl transition-colors",
              isActive && "bg-[#ddf4c5]/50 border-2 border-[#1cb0f6]/20"
            )} />
            <Icon 
              className="h-7 w-7 relative z-10" 
              strokeWidth={isActive ? 3 : 2.5} 
            />
          </Link>
        );
      })}
    </nav>
  );
}
