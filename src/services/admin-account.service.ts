/**
 * Admin Account Service
 * Handles account listing and staff creation via Auth endpoints.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { Pagination } from "@/lib/http-client";

// ==================== TYPES ====================

export interface AccountListItem {
    id: string;
    roleName: string;
    name: string;
    userName: string;
    isActive: boolean;
}

export interface AccountsListApiResponse {
    succeeded: boolean;
    message: string;
    data: AccountListItem[];
    meta: {
        pagination: Pagination;
    };
    errors: string[];
}

// Admin/Manager/Cashier
export interface CreateAccountRequest {
    userName: string;
    fullName: string;
    phone: string;
    password: string;
    image?: string;
    roleId: number;
}

// Chef
export interface CreateChefRequest {
    userName: string;
    fullName: string;
    img?: string;
    phone: string;
    password: string;
    specialty: number;
    skillLevel: string;
}

// Head Chef
export interface CreateHeadChefRequest {
    userName: string;
    fullName: string;
    img?: string;
    phone: string;
    password: string;
    skillLevel: string;
}

// Waiter
export interface CreateWaiterRequest {
    userName: string;
    fullName: string;
    img?: string;
    phone: string;
    password: string;
    areaId: string;
}

// ==================== API CALLS ====================

export async function getAccounts(pageIndex = 1, pageSize = 10, keyword = ""): Promise<AccountsListApiResponse> {
    const query = new URLSearchParams({ pageIndex: pageIndex.toString(), pageSize: pageSize.toString() });
    if (keyword) query.append("keyword", keyword);
    const url = `${API_ENDPOINTS.accounts.list}?${query}`;
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(typeof window !== "undefined" && localStorage.getItem("token")
                ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
                : {}),
        },
    });
    return response.json();
}

/**
 * Create account based on role type
 * - Admin/Manager/Cashier (roleId 1, 5): POST /api/Auth/CreateAccount
 * - Chef (roleId 3): POST /api/Auth/CreateChef
 * - Head Chef (roleId 4): POST /api/Auth/CreateHeadChef
 * - Waiter (roleId 2): POST /api/Auth/CreateWaiter
 */
export async function createAccount(
    data: CreateAccountRequest | CreateChefRequest | CreateHeadChefRequest | CreateWaiterRequest,
    roleId: number
) {
    let endpoint = "";
    let payload: any = data;

    switch (roleId) {
        case 1: // Admin
        case 5: // Cashier
            endpoint = API_ENDPOINTS.accounts.createAccount;
            payload = data as CreateAccountRequest;
            break;
        case 2: // Waiter
            endpoint = API_ENDPOINTS.accounts.createWaiter;
            payload = data as CreateWaiterRequest;
            break;
        case 3: // Chef
            endpoint = API_ENDPOINTS.accounts.createChef;
            payload = data as CreateChefRequest;
            break;
        case 4: // Head Chef
            endpoint = API_ENDPOINTS.accounts.createHeadChef;
            payload = data as CreateHeadChefRequest;
            break;
        default:
            throw new Error(`Invalid roleId: ${roleId}`);
    }

    return httpClient.post<string>(endpoint, payload);
}
