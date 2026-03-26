/**
 * API Configuration
 * Centralized file for all API endpoints used in the application.
 */

// Base URL — reads from env, falls back to dev tunnel URL.
const RAW_API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7260";

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

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

    // ==================== ORDER ITEMS ====================
    orderItems: {
        list: (pageIndex: number, pageSize: number) =>
            `${API_BASE_URL}/api/OrderItem?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        byAccount: `${API_BASE_URL}/api/OrderItem/by-account`,
        updateStatus: `${API_BASE_URL}/api/OrderItem/Update-Status`,
    },

    // ==================== HEAD CHEF ====================
    headChef: {
        availableChefs: `${API_BASE_URL}/api/Chef/available`,
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
        list: `${API_BASE_URL}/api/WorkSchedule`,
        create: `${API_BASE_URL}/api/WorkSchedule`,
        update: `${API_BASE_URL}/api/WorkSchedule`,
        delete: (id: string) => `${API_BASE_URL}/api/WorkSchedule/${id}`,
        checkIn: (id: string) => `${API_BASE_URL}/api/WorkSchedule/CheckIn/${id}`,
        checkOut: (id: string) => `${API_BASE_URL}/api/WorkSchedule/CheckOut/${id}`,
    },

    // ==================== TABLES ====================
    tables: {
        list: `${API_BASE_URL}/api/Table`,
        create: `${API_BASE_URL}/api/Table`,
        detail: (id: string) => `${API_BASE_URL}/api/Table/${id}`,
        byArea: (areaId: string) => `${API_BASE_URL}/api/Table/area/${areaId}`,
        updateInfo: `${API_BASE_URL}/api/Table/update-info`,
        updateStatus: `${API_BASE_URL}/api/Table/update-status`,
        qrSession: (tableId: string) => `${API_BASE_URL}/api/Table/qr-session/${tableId}`,
        refreshQrSession: (tableId: string) => `${API_BASE_URL}/api/Table/qr-session/${tableId}/refresh`,
        bySession: (session: string) => `${API_BASE_URL}/api/Table/by-session/${session}`,
    },

    // ==================== AREAS ====================
    areas: {
        list: `${API_BASE_URL}/api/Area`,
        create: `${API_BASE_URL}/api/Area`,
        update: `${API_BASE_URL}/api/Area`,
        delete: (id: string) => `${API_BASE_URL}/api/Area/${id}`,
    },

    // ==================== ADMIN CATEGORIES ====================
    adminCategories: {
        list: `${API_BASE_URL}/api/Category`,
        create: `${API_BASE_URL}/api/Category`,
        update: `${API_BASE_URL}/api/Category`,
        delete: (id: number) => `${API_BASE_URL}/api/Category/${id}`,
    },

    // ==================== ADMIN PRODUCTS ====================
    adminProducts: {
        list: `${API_BASE_URL}/api/Product`,
        create: `${API_BASE_URL}/api/Product`,
        updateInfo: `${API_BASE_URL}/api/Product/Update-Info`,
        updateStatus: (id: string) => `${API_BASE_URL}/api/Product/Update-Status/${id}`,
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
        employeesByRole: `${API_BASE_URL}/api/Account/employees/by-role`,
        createAccount: `${API_BASE_URL}/api/Auth/CreateAccount`,
        createWaiter: `${API_BASE_URL}/api/Auth/CreateWaiter`,
        createChef: `${API_BASE_URL}/api/Auth/CreateChef`,
        createHeadChef: `${API_BASE_URL}/api/Auth/CreateHeadChef`,
    },

    // ==================== DASHBOARD ====================
    dashboard: {
        summary: `${API_BASE_URL}/api/Dashboard/summary`,
    },

    // ==================== BANKS ====================
    banks: {
        list: `https://api.vietqr.io/v2/banks`,
    },
} as const;
