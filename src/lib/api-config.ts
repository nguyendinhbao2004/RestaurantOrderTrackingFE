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
        createItem: `${API_BASE_URL}/api/OrderItem`,
        onlineCreate: `${API_BASE_URL}/api/Order/online`,
        updateStatus: `${API_BASE_URL}/api/Order/Update-Status`,
    },

    // ==================== PAYMENTS ====================
    payments: {
        createLink: `${API_BASE_URL}/api/Payment/create-link`,
        paymentInfo: (orderId: string) => `${API_BASE_URL}/api/Payment/payment-info/${orderId}`,
    },

    // ==================== CASHIER ====================
    cashier: {
        createBill: `${API_BASE_URL}/api/Cashier/bill`,
        payBill: `${API_BASE_URL}/api/Cashier/bill/pay`,
    },

    // ==================== WORK SCHEDULE ====================
    workSchedule: {
        checkIn: (accountId: string) => `${API_BASE_URL}/api/WorkSchedule/CheckIn/${accountId}`,
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

    // ==================== CUSTOMERS ====================
    customers: {
        byAccount: (accountId: string) => `${API_BASE_URL}/api/Customer/account/${accountId}`,
    },

    // ==================== ACCOUNTS ====================
    accounts: {
        list: `${API_BASE_URL}/api/Account`,
    },

    // ==================== BANKS ====================
    banks: {
        list: `https://api.vietqr.io/v2/banks`,
    },
} as const;
