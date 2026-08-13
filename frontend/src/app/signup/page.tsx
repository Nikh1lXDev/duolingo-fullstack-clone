"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
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

    // Client Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.register({ 
        username, 
        email, 
        display_name: displayName || username, // fallback
        password 
      });
      await refreshUser();
      router.push("/");
    } catch (err) {
      console.error("Signup failed");
      const error = err as Error;
      const errMsg = error.message || "";
      if (errMsg.includes("username") || errMsg.includes("Username") || errMsg.includes("taken")) {
        setError("That username is already in use.");
      } else if (errMsg.includes("email") || errMsg.includes("Email") || errMsg.includes("registered")) {
        setError("That email is already registered.");
      } else if (errMsg.includes("409")) {
        setError("That username or email is already in use.");
      } else if (errMsg.includes("422")) {
        setError("Please check your input and try again.");
      } else {
        setError(errMsg || "An unexpected error occurred. Please try again.");
      }
      setPassword("");
      setConfirmPassword("");
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
            Create your profile
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
              <label htmlFor="username" className="text-sm font-bold text-[#777777]">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. duolingo_fan_99"
                required
                disabled={isSubmitting}
                className="w-full p-4 border-2 border-[#e5e5e5] rounded-xl font-bold text-[#3c3c3c] bg-[#f7f7f7] focus:border-[#1cb0f6] focus:bg-white transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-bold text-[#777777]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                disabled={isSubmitting}
                className="w-full p-4 border-2 border-[#e5e5e5] rounded-xl font-bold text-[#3c3c3c] bg-[#f7f7f7] focus:border-[#1cb0f6] focus:bg-white transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="displayName" className="text-sm font-bold text-[#777777]">
                Display Name (Optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
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
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                disabled={isSubmitting}
                className="w-full p-4 border-2 border-[#e5e5e5] rounded-xl font-bold text-[#3c3c3c] bg-[#f7f7f7] focus:border-[#1cb0f6] focus:bg-white transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-sm font-bold text-[#777777]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                minLength={8}
                disabled={isSubmitting}
                className="w-full p-4 border-2 border-[#e5e5e5] rounded-xl font-bold text-[#3c3c3c] bg-[#f7f7f7] focus:border-[#1cb0f6] focus:bg-white transition-colors outline-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4"
              disabled={isSubmitting || !username || !email || !password || !confirmPassword}
            >
              CREATE ACCOUNT
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-sm font-bold text-[#1cb0f6] hover:text-[#1899d6] uppercase tracking-wide"
            >
              ALREADY HAVE AN ACCOUNT? LOG IN
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
