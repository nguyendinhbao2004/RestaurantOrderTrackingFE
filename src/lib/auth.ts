import { User, Role } from '@/types';

const TOKEN_KEY = 'restaurant_auth_token';

interface JwtPayload {
    sub?: string;
    unique_name?: string;
    fullName?: string;
    email?: string;
    role?: string;
    exp?: number;
}

const VALID_ROLES: Role[] = ['admin', 'chef', 'headchef', 'waiter', 'cashier', 'customer'];

function normalizeRole(role: unknown): Role | null {
    if (typeof role !== 'string') return null;
    const normalizedRole = role.toLowerCase() as Role;
    return VALID_ROLES.includes(normalizedRole) ? normalizedRole : null;
}

function decodeBase64Url(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function parseJwtPayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
    } catch {
        return null;
    }
}

export function getUserFromToken(token: string): User | null {
    const jwtPayload = parseJwtPayload(token);
    
    if (!jwtPayload) return null;

    if (typeof jwtPayload.exp === 'number' && jwtPayload.exp * 1000 < Date.now()) {
        removeToken();
        return null;
    }

    const role = normalizeRole(jwtPayload.role);
    const id = jwtPayload.sub || '';
    const userName = jwtPayload.unique_name || jwtPayload.email || '';

    if (!id || !role) {
        return null;
    }

    return {
        id,
        name: jwtPayload.fullName || userName,
        email: jwtPayload.email || userName,
        role,
        avatar: undefined,
    };
}

// --- QUẢN LÝ STORAGE ---

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUser(): User | null {
    const token = getToken();
    if (!token) return null;
    return getUserFromToken(token); // Tự động check hạn và parse thông tin
}

// --- QUẢN LÝ ROUTING & PHÂN QUYỀN (ROUTE GUARDS) ---

export const roleRedirectPaths: Record<Role, string> = {
    admin: '/admin',
    chef: '/chef',
    headchef: '/head-chef',
    waiter: '/waiter',
    cashier: '/cashier',
    customer: '/menu',
};

export const protectedRoutes: Record<string, Role[]> = {
    '/admin': ['admin'],
    '/admin/employees': ['admin'],
    '/admin/revenue': ['admin'],
    '/chef': ['chef'],
    '/head-chef': ['headchef'],
    '/waiter': ['waiter'],
    '/cashier': ['cashier'],
    '/tables': ['admin', 'waiter', 'cashier'],
};

export const publicRoutes = ['/', '/login', '/order', '/menu'];

export function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route =>
        pathname === route || 
        pathname.startsWith('/order') || 
        pathname.startsWith('/menu')
    );
}

export function hasRouteAccess(pathname: string, userRole: Role | null): boolean {
    if (isPublicRoute(pathname)) return true;

    if (!userRole) return false;

    // Kiểm tra quyền theo prefix của route
    for (const [route, roles] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route)) {
            return roles.includes(userRole);
        }
    }
    
    return false;
}
