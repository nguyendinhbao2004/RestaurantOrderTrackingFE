/**
 * Auth Service
 * Encapsulates all authentication-related API calls.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { ApiResponse } from "@/lib/http-client";

// ==================== TYPES ====================

export interface LoginRequest {
    userName: string;
    password: string;
}

export interface LoginResponseData {
    id: string;
    userName: string;
    role: string;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RegisterCustomerRequest {
    userName: string;
    fullName: string;
    phone: string;
    address: string;
    password: string;
    image: string;
}

// ==================== API CALLS ====================

export async function loginApi(
    credentials: LoginRequest
): Promise<ApiResponse<LoginResponseData>> {
    const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    const data = await response.json().catch(() => ({
        data: null,
        succeeded: false,
        message: "Failed to parse server response",
        errors: [],
    }));

    if (!response.ok || !data.succeeded) {
        throw {
            status: response.status,
            message: data.message || "Login failed",
            errors: data.errors || [],
        };
    }

    return data as ApiResponse<LoginResponseData>;
}

export async function registerCustomerApi(
    data: RegisterCustomerRequest
): Promise<ApiResponse<string>> {
    const response = await fetch(API_ENDPOINTS.auth.registerCustomer, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({
        succeeded: false,
        message: "Failed to parse server response",
        data: null,
        errors: [],
    }));

    if (!response.ok || !result.succeeded) {
        throw {
            status: response.status,
            message: result.message || "Registration failed",
            errors: result.errors || [],
        };
    }

    return result as ApiResponse<string>;
}
