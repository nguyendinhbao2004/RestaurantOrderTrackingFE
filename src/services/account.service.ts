/**
 * Account Service
 * Encapsulates all account-related API calls.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { ApiResponse, Pagination } from "@/lib/http-client";
import { Employee, Role } from "@/types";

// ==================== TYPES ====================

export interface AccountData {
    id: string;
    roleName: string;
    name: string;
    userName: string;
    isActive: boolean;
}

export interface AccountsApiResponse {
    succeeded: boolean;
    message: string;
    data: AccountData[];
    meta: {
        pagination: Pagination;
    };
    errors: string[];
}

// ==================== API CALLS ====================

/**
 * Fetch accounts with pagination
 * @param pageIndex - Page number (1-based)
 * @param pageSize - Number of records per page
 * @returns Accounts data with pagination info
 */
export async function getAccountsApi(
    pageIndex: number = 1,
    pageSize: number = 10
): Promise<AccountsApiResponse> {
    const url = `${API_ENDPOINTS.accounts.list}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
    const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Map AccountData from API to Employee type for UI
 */
export function mapAccountToEmployee(account: AccountData): Employee {
    return {
        id: account.id,
        name: account.name,
        email: account.userName,
        phone: undefined,
        role: (account.roleName.toLowerCase() as Role) || 'customer',
        avatar: undefined,
        hireDate: new Date(),
        isActive: account.isActive,
    };
}
