"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.login({ username: identifier, password });
      await refreshUser();
      router.push("/");
    } catch {
      console.error("Login failed");
      setError("Incorrect username/email or password.");
      setPassword(""); // Clear password on error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="w-full max-w-md p-8 bg-[#182830] border-2 border-[#2b3d47] rounded-3xl shadow-xl">
          <h1 className="mb-6 text-3xl font-black text-center text-white">
            Log in
          </h1>

          {error && (
            <div
              className="mb-6 p-4 text-sm font-extrabold text-white bg-[#ff4b4b] rounded-2xl border border-[#ea2b2b]"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="identifier" className="text-xs font-black uppercase text-[#afafaf] tracking-wider">
                Username or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or email"
                required
                disabled={isSubmitting}
                className="w-full p-4 border-2 border-[#2b3d47] rounded-2xl font-bold text-white bg-[#131f24] focus:border-[#1cb0f6] transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-black uppercase text-[#afafaf] tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isSubmitting}
                className="w-full p-4 border-2 border-[#2b3d47] rounded-2xl font-bold text-white bg-[#131f24] focus:border-[#1cb0f6] transition-colors outline-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4 bg-[#1cb0f6] hover:bg-[#1899d6] border-b-4 border-[#0081c9] active:border-b-0 text-white font-black text-sm uppercase tracking-wider rounded-2xl"
              disabled={isSubmitting || !identifier || !password}
            >
              LOG IN
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/signup"
              className="text-xs font-black text-[#1cb0f6] hover:text-[#84d8ff] uppercase tracking-wider"
            >
              DON&apos;T HAVE AN ACCOUNT? SIGN UP
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
