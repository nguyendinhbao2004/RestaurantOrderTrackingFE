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

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // Find employee by email
        const employee = employees.find(
            (emp) => emp.email.toLowerCase() === email.toLowerCase() && emp.isActive
        );

        if (!employee) {
            return { success: false, error: 'User not found' };
        }

        // Check password (demo only)
        const expectedPassword = demoPasswords[email.toLowerCase()];
        if (!expectedPassword || password !== expectedPassword) {
            return { success: false, error: 'Invalid password' };
        }

        // Create user object
        const authUser: User = {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            avatar: employee.avatar,
        };

        // Create and store token
        const token = createToken(authUser);
        setToken(token);
        setUser(authUser);

        // Redirect based on role
        router.push(roleRedirectPaths[employee.role]);

        return { success: true };
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
