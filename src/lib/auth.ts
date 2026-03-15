import { User, Role } from '@/types';

// Key dùng để lưu trong localStorage
const TOKEN_KEY = 'restaurant_auth_token';

interface JwtPayload {
    sub?: string;
    unique_name?: string;
    fullName?: string;
    email?: string;
    role?: string;
    exp?: number;
}

const VALID_ROLES: Role[] = ['admin', 'chef', 'waiter', 'cashier', 'customer'];

function normalizeRole(role: unknown): Role | null {
    if (typeof role !== 'string') return null;
    const normalizedRole = role.toLowerCase() as Role;
    return VALID_ROLES.includes(normalizedRole) ? normalizedRole : null;
}

// Giải mã Base64Url chuẩn xác cho JWT
function decodeBase64Url(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

// Hàm parse Payload từ JWT (JWT luôn có 3 phần: Header.Payload.Signature)
function parseJwtPayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
    } catch {
        return null;
    }
}

// Đổi tên từ verifyToken -> getUserFromToken vì Frontend chỉ "Đọc" chứ không "Xác thực" chữ ký
export function getUserFromToken(token: string): User | null {
    const jwtPayload = parseJwtPayload(token);
    
    if (!jwtPayload) return null;

    // Kiểm tra Token đã hết hạn chưa
    if (typeof jwtPayload.exp === 'number' && jwtPayload.exp * 1000 < Date.now()) {
        removeToken(); // Xóa luôn token cũ nếu phát hiện hết hạn
        return null;
    }

    const role = normalizeRole(jwtPayload.role);
    const id = jwtPayload.sub || '';
    const userName = jwtPayload.unique_name || jwtPayload.email || '';

    // Nếu thiếu thông tin quan trọng, coi như token không hợp lệ
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
    waiter: '/waiter',
    cashier: '/cashier',
    customer: '/customer',
};

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

export const publicRoutes = ['/', '/login', '/order', '/customer', '/menu'];

export function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route =>
        pathname === route || 
        pathname.startsWith('/order') || 
        pathname.startsWith('/customer') || 
        pathname.startsWith('/menu')
    );
}

export function hasRouteAccess(pathname: string, userRole: Role | null): boolean {
    // Luôn cho phép truy cập public routes
    if (isPublicRoute(pathname)) return true;

    // Không có role (chưa đăng nhập) => từ chối
    if (!userRole) return false;

    // Kiểm tra quyền theo prefix của route
    for (const [route, roles] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route)) {
            return roles.includes(userRole);
        }
    }

    // Mặc định từ chối nếu route không có trong danh sách public/protected hợp lệ
    return false;
}