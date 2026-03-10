/**
 * API Configuration
 * Centralized file for all API endpoints used in the application.
 */

// Base URL — reads from env, falls back to default
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5015";

// ==================== AUTH ====================
export const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/api/Auth/login`,
        register: `${API_BASE_URL}/api/Auth/register`,
        registerCustomer: `${API_BASE_URL}/api/Auth/RegisterCustomer`,
        refreshToken: `${API_BASE_URL}/api/Auth/refresh-token`,
        logout: `${API_BASE_URL}/api/Auth/logout`,
    },

    // ==================== MENU ====================
    menu: {
        list: `${API_BASE_URL}/api/Menu`,
        detail: (id: string) => `${API_BASE_URL}/api/Menu/${id}`,
    },

    // ==================== PRODUCTS ====================
    products: {
        list: `${API_BASE_URL}/api/Product`,
        detail: (id: string) => `${API_BASE_URL}/api/Product/${id}`,
    },

    // ==================== CATEGORIES ====================
    categories: {
        list: `${API_BASE_URL}/api/Category`,
    },

    // ==================== ORDERS ====================
    orders: {
        list: `${API_BASE_URL}/api/Order`,
        detail: (id: string) => `${API_BASE_URL}/api/Order/${id}`,
        create: `${API_BASE_URL}/api/Order`,
        updateStatus: (id: string) => `${API_BASE_URL}/api/Order/${id}/status`,
    },

    // ==================== TABLES ====================
    tables: {
        list: `${API_BASE_URL}/api/Table`,
        detail: (id: string) => `${API_BASE_URL}/api/Table/${id}`,
        byArea: (areaId: string) => `${API_BASE_URL}/api/Table/area/${areaId}`,
        qrSession: (tableId: string) => `${API_BASE_URL}/api/Table/qr-session/${tableId}`,
        refreshQrSession: (tableId: string) => `${API_BASE_URL}/api/Table/qr-session/${tableId}/refresh`,
        bySession: (session: string) => `${API_BASE_URL}/api/Table/by-session/${session}`,
        updateStatus: `${API_BASE_URL}/api/Table/update-status`,
    },

    // ==================== EMPLOYEES ====================
    employees: {
        list: `${API_BASE_URL}/api/Employee`,
        detail: (id: string) => `${API_BASE_URL}/api/Employee/${id}`,
    },
} as const;
