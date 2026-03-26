/**
 * Admin Schedule Service
 * Encapsulates work schedule CRUD + check-in/check-out.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { Pagination } from "@/lib/http-client";

// ==================== TYPES ====================

export interface ScheduleData {
    id: string;
    accountId: string;
    accountName: string;
    workDate: string;
    startTime: string;
    endTime: string;
    shiftName: string;
    actualCheckIn: string | null;
    actualCheckOut: string | null;
    status: string;
    note: string;
}

export interface ScheduleListParams {
    keyword?: string;
    pageIndex?: number;
    pageSize?: number;
}

export interface SchedulesApiResponse {
    succeeded: boolean;
    message: string;
    data: ScheduleData[];
    meta: {
        pagination: Pagination;
    };
    errors: string[];
}

export interface CreateScheduleRequest {
    accountId: string;
    workDate: string;
    startTime: string;
    endTime: string;
    shiftName: string;
    note?: string;
}

export interface UpdateScheduleRequest {
    id: string;
    accountId: string;
    workDate: string;
    startTime: string;
    endTime: string;
    shiftName: string;
    note?: string;
    status?: number;
}

// ==================== API CALLS ====================

export async function getSchedules(params?: ScheduleListParams): Promise<SchedulesApiResponse> {
    const query = new URLSearchParams();
    if (params?.keyword) query.append("keyword", params.keyword);
    if (params?.pageIndex) query.append("pageIndex", params.pageIndex.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    const url = `${API_ENDPOINTS.workSchedule.list}${query.toString() ? `?${query}` : ""}`;
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

export async function createSchedule(data: CreateScheduleRequest) {
    return httpClient.post<string>(API_ENDPOINTS.workSchedule.create, data);
}

export async function updateSchedule(data: UpdateScheduleRequest) {
    return httpClient.put<string>(API_ENDPOINTS.workSchedule.update, data);
}

export async function deleteSchedule(id: string) {
    return httpClient.delete<boolean>(API_ENDPOINTS.workSchedule.delete(id));
}

export async function checkInSchedule(id: string) {
    return httpClient.put<void>(API_ENDPOINTS.workSchedule.checkIn(id));
}

export async function checkOutSchedule(id: string) {
    return httpClient.put<void>(API_ENDPOINTS.workSchedule.checkOut(id));
}
