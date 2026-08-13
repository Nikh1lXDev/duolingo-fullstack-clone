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
        <div className="w-full max-w-md p-8 bg-white border-2 border-[#e5e5e5] rounded-2xl">
          <h1 className="mb-6 text-3xl font-bold text-center text-[#3c3c3c]">
            Log in
          </h1>

          {error && (
            <div
              className="mb-6 p-4 text-sm font-bold text-white bg-[#ff4b4b] rounded-xl"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="identifier" className="text-sm font-bold text-[#777777]">
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
                className="w-full p-4 border-2 border-[#e5e5e5] rounded-xl font-bold text-[#3c3c3c] bg-[#f7f7f7] focus:border-[#1cb0f6] focus:bg-white transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-bold text-[#777777]">
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
                className="w-full p-4 border-2 border-[#e5e5e5] rounded-xl font-bold text-[#3c3c3c] bg-[#f7f7f7] focus:border-[#1cb0f6] focus:bg-white transition-colors outline-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4"
              disabled={isSubmitting || !identifier || !password}
            >
              LOG IN
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/signup"
              className="text-sm font-bold text-[#1cb0f6] hover:text-[#1899d6] uppercase tracking-wide"
            >
              DON&apos;T HAVE AN ACCOUNT? SIGN UP
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
