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
    areaId?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
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
