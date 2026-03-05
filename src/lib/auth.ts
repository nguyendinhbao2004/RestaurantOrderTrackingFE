import { User, Role } from '@/types';

// Simple base64 encoding for demo purposes (frontend-only)
// In production, use a real JWT library with proper backend

const TOKEN_KEY = 'restaurant_auth_token';
const SECRET = 'restaurant-secret-key-2024'; // Demo only

interface TokenPayload {
    user: User;
    exp: number;
}

// Encode user data to a simple token (base64)
export function createToken(user: User): string {
    const payload: TokenPayload = {
        user,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    return btoa(JSON.stringify(payload));
}

// Decode and verify token
export function verifyToken(token: string): User | null {
    try {
        const payload: TokenPayload = JSON.parse(atob(token));

        // Check expiration
        if (payload.exp < Date.now()) {
            removeToken();
            return null;
        }

        return payload.user;
    } catch {
        return null;
    }
}

// Get token from localStorage
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

// Save token to localStorage
export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
}

// Remove token from localStorage
export function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
}

// Get current user from stored token
export function getCurrentUser(): User | null {
    const token = getToken();
    if (!token) return null;
    return verifyToken(token);
}

// Role-based redirect paths
export const roleRedirectPaths: Record<Role, string> = {
    admin: '/admin',
    chef: '/chef',
    waiter: '/waiter',
    cashier: '/cashier',
    customer: '/customer',
};

// Protected routes and their allowed roles
export const protectedRoutes: Record<string, Role[]> = {
    '/admin': ['admin'],
    '/admin/employees': ['admin'],
    '/admin/revenue': ['admin'],
    '/chef': ['chef'],
    '/waiter': ['waiter'],
    '/cashier': ['cashier'],
    '/tables': ['admin', 'waiter', 'cashier'],
    '/customer': ['customer'],
};

// Public routes that don't require authentication
export const publicRoutes = ['/', '/login', '/order', '/customer'];

// Check if a route is public
export function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route =>
        pathname === route || pathname.startsWith('/order') || pathname.startsWith('/customer')
    );
}

// Check if user has access to a route
export function hasRouteAccess(pathname: string, userRole: Role | null): boolean {
    // Public routes are always accessible
    if (isPublicRoute(pathname)) return true;

    // No user = no access to protected routes
    if (!userRole) return false;

    // Check specific route permissions
    for (const [route, roles] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route)) {
            return roles.includes(userRole);
        }
    }

    // Default: require authentication for unknown routes
    return false;
}
