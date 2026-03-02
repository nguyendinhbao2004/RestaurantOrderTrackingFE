/**
 * API Configuration
 * Centralized file for all API endpoints used in the application.
 */

// Base URL — reads from env, falls back to default
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7260";

// ==================== AUTH ====================
export const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/api/Auth/login`,
        register: `${API_BASE_URL}/api/Auth/register`,
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
    },

    // ==================== EMPLOYEES ====================
    employees: {
        list: `${API_BASE_URL}/api/Employee`,
        detail: (id: string) => `${API_BASE_URL}/api/Employee/${id}`,
    },
} as const;
