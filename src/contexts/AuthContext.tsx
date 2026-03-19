"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role } from '@/types';
import {
    getToken,
    setToken,
    removeToken,
    getUserFromToken,
    roleRedirectPaths,
    hasRouteAccess,
    isPublicRoute,
} from '@/lib/auth';
import { loginApi } from '@/services/auth.service';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    hasPermission: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_TOKEN_KEY = 'restaurant_refresh_token';
const AREA_ID_KEY = 'restaurant_area_id';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Initialize auth state from stored token
    useEffect(() => {
        const token = getToken();
        if (token) {
            const storedUser = getUserFromToken(token);
            if (storedUser) {
                storedUser.areaId = localStorage.getItem(AREA_ID_KEY) || undefined;
                setUser(storedUser);
            } else {
                removeToken();
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(AREA_ID_KEY);
                localStorage.removeItem('accessToken');
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
            const response = await loginApi({ userName: username, password });
            const { accessToken, refreshToken, role, id, areaId } = response.data;

            // Map API response to User object
            const authUser: User = {
                id,
                name: response.data.userName,
                email: username,
                role: role.toLowerCase() as Role,
                avatar: undefined,
                areaId: areaId ?? undefined,
            };

            // Store tokens
            setToken(accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            if (areaId) localStorage.setItem(AREA_ID_KEY, areaId);

            setUser(authUser);

            // Redirect based on role
            router.push(roleRedirectPaths[authUser.role]);
            return { success: true };
        } catch (err: unknown) {
            const error = err as { message?: string };
            return { success: false, error: error.message || "Network error" };
        }
    }, [router]);

    const logout = useCallback(() => {
        removeToken();
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(AREA_ID_KEY);
        localStorage.removeItem('accessToken');
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
