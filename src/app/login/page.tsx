"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, logout, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background">
                <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background">
                <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-muted-foreground mb-4">Redirecting...</p>
                <button 
                    onClick={logout}
                    className="text-sm text-violet-600 hover:underline"
                >
                    Sign out instead
                </button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error || "Login failed");
            setIsLoading(false);
        }
        // Success - AuthContext handles redirect
    };

    const demoAccounts = [
        { email: "john.anderson@restaurant.com", password: "admin123", role: "Admin" },
        { email: "maria.garcia@restaurant.com", password: "chef123", role: "Chef" },
        { email: "sarah.johnson@restaurant.com", password: "waiter123", role: "Waiter" },
        { email: "emily.davis@restaurant.com", password: "cashier123", role: "Cashier" },
    ];

    const fillDemoCredentials = (email: string, password: string) => {
        setEmail(email);
        setPassword(password);
        setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo - clickable to home */}
                <div className="text-center">
                    <Link href="/" className="inline-block group">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 mb-4 group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/30">
                            <span className="text-white font-bold text-2xl">R</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Restaurant Staff Login
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Login Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                            Enter your credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Email</label>
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
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

                {/* Demo Accounts */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Demo Accounts</CardTitle>
                        <CardDescription className="text-xs">
                            Click to auto-fill credentials
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2">
                            {demoAccounts.map((account) => (
                                <Button
                                    key={account.email}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-auto py-2"
                                    onClick={() => fillDemoCredentials(account.email, account.password)}
                                >
                                    <div className="text-left">
                                        <div className="font-medium">{account.role}</div>
                                        <div className="text-muted-foreground truncate text-[10px]">
                                            {account.email.split("@")[0]}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Notice */}
                <p className="text-center text-sm text-muted-foreground">
                    Customers can access the menu via{" "}
                    <a href="/order?table=1" className="text-violet-600 hover:underline">
                        QR code
                    </a>
                </p>
            </div>
        </div>
    );
}
