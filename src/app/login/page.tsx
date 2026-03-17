"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { registerCustomerApi } from "@/services/auth.service";
import { CheckCircle2, UserPlus, LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    // Registration extra fields
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [image, setImage] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, logout, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-violet-50/50 dark:bg-violet-950/20">
                <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-violet-50/50 dark:bg-violet-950/20">
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

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        const result = await login(username, password);

        if (!result.success) {
            setError(result.error || "Login failed");
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const response = await registerCustomerApi({
                userName: username,
                fullName,
                phone,
                address,
                password,
                image: image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", 
            });

            if (response.succeeded || response.data) {
                setSuccessMessage("Customer registered successfully. Please sign in.");
                setIsLoginMode(true);
                // Keep username/password filled for easy login
            } else {
                setError(response.message || "Registration failed");
            }
        } catch (err: any) {
             setError(err.message || "An unexpected error occurred during registration");
        } finally {
            setIsLoading(false);
        }
    };

    const demoAccounts = [
        { username: "baond", password: "admin123", role: "Admin" },
        { username: "chef1", password: "chef123", role: "Chef" },
        { username: "waiter1", password: "waiter123", role: "Waiter" },
        { username: "cashier1", password: "cashier123", role: "Cashier" },
    ];

    const fillDemoCredentials = (username: string, password: string) => {
        setIsLoginMode(true);
        setUsername(username);
        setPassword(password);
        setError("");
        setSuccessMessage("");
    };

    return (
        <div className="min-h-screen bg-violet-50/50 dark:bg-violet-950/20">
            {/* Top bar */}
            <div className="w-full px-6 py-4 flex items-center justify-between border-b border-border/40 bg-white/60 dark:bg-black/20 backdrop-blur-sm">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <span className="font-bold text-base tracking-tight text-violet-600">
                        Restaurant
                    </span>
                </Link>

                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-violet-600 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Quay về trang chủ
                </Link>
            </div>

            <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-violet-600">
                            Đăng nhập
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Auth Card */}
                <Card className="border-border/50 shadow-xl shadow-violet-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           {isLoginMode ? <LogIn className="w-5 h-5 text-violet-600"/> : <UserPlus className="w-5 h-5 text-violet-600" />}
                           {isLoginMode ? 'Sign In' : 'Create Customer Account'}
                        </CardTitle>
                        <CardDescription>
                            {isLoginMode ? 'Enter your credentials to continue' : 'Sign up to order food online'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {successMessage && (
                            <div className="mb-4 flex items-start gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>{successMessage}</p>
                            </div>
                        )}

                        <form onSubmit={isLoginMode ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                            {/* Shared Username Field */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Username *</label>
                                <Input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Registration Only Fields */}
                            {!isLoginMode && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                                        <Input
                                            type="text"
                                            placeholder="John Doe"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                                            <Input
                                                type="tel"
                                                placeholder="09..."
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Avatar URL</label>
                                            <Input
                                                type="url"
                                                placeholder="https://..."
                                                value={image}
                                                onChange={(e) => setImage(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Delivery Address *</label>
                                        <Input
                                            type="text"
                                            placeholder="123 Main St..."
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Shared Password Field */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Password *</label>
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
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-5"
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
                                    isLoginMode ? "Sign In" : "Register Account"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-border/50 pt-4 pb-4 bg-muted/20">
                        <p className="text-sm text-muted-foreground mr-1">
                            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setError("");
                                setSuccessMessage("");
                            }}
                            className="text-sm font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                        >
                            {isLoginMode ? "Register as Customer" : "Sign In"}
                        </button>
                    </CardFooter>
                </Card>

                {/* Customer Notice */}
                <p className="text-center text-sm text-muted-foreground">
                    Customers can access the menu via QR code
                </p>
            </div>
            </div>
        </div>
    );
}
