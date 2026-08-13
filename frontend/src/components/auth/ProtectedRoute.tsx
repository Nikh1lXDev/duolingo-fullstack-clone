"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Avoid redirecting if already on login/signup
      if (pathname !== "/login" && pathname !== "/signup") {
        router.push("/login");
      }
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return null; // AuthContext already shows a loader
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
