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

export interface CreateAccountRequest {
    userName: string;
    fullName: string;
    phone: string;
    password: string;
    image?: string;
    roleId: number;
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

export async function createAccount(data: CreateAccountRequest) {
    return httpClient.post<string>(API_ENDPOINTS.accounts.createAccount, data);
}
