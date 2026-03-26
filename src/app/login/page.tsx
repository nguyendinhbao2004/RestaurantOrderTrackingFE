"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout, isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50/50 dark:bg-orange-950/20">
        <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50/50 dark:bg-orange-950/20">
        <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted-foreground mb-4">Redirecting...</p>
        <button
          onClick={logout}
          className="text-sm text-orange-600 hover:underline"
        >
          Sign out instead
        </button>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/50 dark:bg-orange-950/20">
      {/* Top bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between border-b border-border/40 bg-white/60 dark:bg-stone-950/20 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-base tracking-tight text-orange-600">
            Restaurant
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-orange-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home page
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              <span className="text-orange-600">LOGIN</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          <Card className="border-border/50 shadow-xl shadow-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-orange-600" />
                Sign In
              </CardTitle>
              <CardDescription>
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Username *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Password *
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-5"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Customers can access the menu via QR code
          </p>
        </div>
      </div>
    </div>
  );
}