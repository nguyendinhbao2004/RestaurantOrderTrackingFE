"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role } from '@/types';
import { employees } from '@/lib/mock-data';
import {
    createToken,
    getToken,
    setToken,
    removeToken,
    verifyToken,
    roleRedirectPaths,
    hasRouteAccess,
    isPublicRoute,
} from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    hasPermission: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo passwords for each employee (in real app, this would be backend)
const demoPasswords: Record<string, string> = {
    'john.anderson@restaurant.com': 'admin123',
    'maria.garcia@restaurant.com': 'chef123',
    'david.chen@restaurant.com': 'chef123',
    'sarah.johnson@restaurant.com': 'waiter123',
    'michael.brown@restaurant.com': 'waiter123',
    'emily.davis@restaurant.com': 'cashier123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Initialize auth state from stored token
    useEffect(() => {
        const token = getToken();
        if (token) {
            const storedUser = verifyToken(token);
            if (storedUser) {
                setUser(storedUser);
            } else {
                removeToken();
            }
        }
        setIsLoading(false);
    }, []);

    // Route protection effect
    useEffect(() => {
        if (isLoading) return;

        // Skip protection for public routes
        if (isPublicRoute(pathname)) return;

        // Redirect to login if not authenticated
        if (!user) {
            router.push('/login');
            return;
        }

        // Check if user has access to current route
        if (!hasRouteAccess(pathname, user.role)) {
            // Redirect to their default page
            router.push(roleRedirectPaths[user.role]);
        }
    }, [user, pathname, isLoading, router]);

    const isAuthenticated = user !== null;

    const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch("http://localhost:5015/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userName: username, password }),
            });
            const data = await res.json();
            if (!res.ok || !data.succeeded) {
                return { success: false, error: data.message || "Login failed" };
            }
            // Extract user info and tokens
            const { accessToken, refreshToken, userName, role, id } = data.data;
            const authUser = {
                id: data.data.id,
                name: data.data.userName,
                email: username, // If you want to store username in email field, or add a username field to User type
                role: data.data.role.toLowerCase(),
                avatar: undefined, // Optionally map avatar if provided by API
            };
            // Store accessToken (optionally refreshToken)
            setToken(accessToken);
            setUser(authUser);
            // Redirect based on role
            router.push(roleRedirectPaths[authUser.role as Role]);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message || "Network error" };
        }
    }, [router]);

    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        router.push('/login');
    }, [router]);

    const hasPermission = useCallback((allowedRoles: Role[]) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
