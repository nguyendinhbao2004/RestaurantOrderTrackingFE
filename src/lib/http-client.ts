/**
 * HTTP Client
 * A lightweight, typed wrapper around fetch for making API calls.
 * Handles JSON serialization, auth headers, and error handling.
 */

import { getToken } from "@/lib/auth";

// ==================== TYPES ====================

export interface Pagination {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface Meta {
    pagination?: Pagination;
}

export interface ApiResponse<T = unknown> {
    succeeded: boolean;
    message: string;
    data: T;
    meta?: Meta;
    errors: string[];
}

export interface ApiError {
    status: number;
    message: string;
    errors: string[];
}

// ==================== CLIENT ====================

async function request<T>(
    url: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({
        data: null,
        succeeded: false,
        message: "Failed to parse server response",
        errors: [],
    }));

    if (!response.ok || !data.succeeded) {
        const error: ApiError = {
            status: response.status,
            message: data.message || `Request failed with status ${response.status}`,
            errors: data.errors || [],
        };
        throw error;
    }

    return data as ApiResponse<T>;
}

// ==================== HTTP METHODS ====================

export const httpClient = {
    get: <T>(url: string, options?: RequestInit) =>
        request<T>(url, { ...options, method: "GET" }),

    post: <T>(url: string, body?: unknown, options?: RequestInit) =>
        request<T>(url, {
            ...options,
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(url: string, body?: unknown, options?: RequestInit) =>
        request<T>(url, {
            ...options,
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        }),

    patch: <T>(url: string, body?: unknown, options?: RequestInit) =>
        request<T>(url, {
            ...options,
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(url: string, options?: RequestInit) =>
        request<T>(url, { ...options, method: "DELETE" }),
};
