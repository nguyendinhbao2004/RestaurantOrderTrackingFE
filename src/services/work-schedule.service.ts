/**
 * Work Schedule Service
 * Handles cashier shift check-in on login.
 */

import { API_ENDPOINTS } from "@/lib/api-config";

export interface CashierCheckInNotice {
  type: "success" | "warning" | "error";
  message: string;
}

export const CASHIER_CHECKIN_NOTICE_KEY = "cashier_checkin_notice";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseResponsePayload(raw: string): unknown {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function resolveNoticeType(
  message: string,
  fallback: CashierCheckInNotice["type"],
): CashierCheckInNotice["type"] {
  const normalized = message.toLowerCase();

  if (normalized.includes("missed your shift") || normalized.includes("absent")) {
    return "warning";
  }

  return fallback;
}

function buildHeaders(accessToken?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function requestCheckIn(url: string, headers: HeadersInit): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers,
  });
}

export async function checkInCashierShift(
  accountId: string,
  accessToken?: string,
): Promise<CashierCheckInNotice> {
  const response = await requestCheckIn(
    API_ENDPOINTS.workSchedule.checkIn(accountId),
    buildHeaders(accessToken),
  );

  const payload = parseResponsePayload(await response.text());

  if (Array.isArray(payload)) {
    const message =
      payload.find(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      ) || "Unable to check in. Please try again.";

    return {
      type: resolveNoticeType(message, response.ok ? "warning" : "error"),
      message,
    };
  }

  if (isRecord(payload)) {
    const message =
      typeof payload.message === "string" && payload.message.trim().length > 0
        ? payload.message
        : "";

    if (payload.succeeded === true) {
      return {
        type: resolveNoticeType(message || "Checked in successfully", "success"),
        message: message || "Checked in successfully",
      };
    }

    const errors = Array.isArray(payload.errors)
      ? payload.errors.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
      : [];

    const fallbackMessage =
      errors[0] || message || "Unable to check in. Please try again.";

    return {
      type: resolveNoticeType(fallbackMessage, response.ok ? "warning" : "error"),
      message: fallbackMessage,
    };
  }

  if (typeof payload === "string" && payload.trim().length > 0) {
    return {
      type: resolveNoticeType(payload, response.ok ? "success" : "error"),
      message: payload,
    };
  }

  if (response.ok) {
    return {
      type: "success",
      message: "Checked in successfully",
    };
  }

  return {
    type: "error",
    message: "Unable to check in. Please try again.",
  };
}

export function cacheCashierCheckInNotice(notice: CashierCheckInNotice): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CASHIER_CHECKIN_NOTICE_KEY, JSON.stringify(notice));
}

export function consumeCashierCheckInNotice(): CashierCheckInNotice | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(CASHIER_CHECKIN_NOTICE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(CASHIER_CHECKIN_NOTICE_KEY);

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const { type, message } = parsed;

    if (
      (type === "success" || type === "warning" || type === "error") &&
      typeof message === "string" &&
      message.trim().length > 0
    ) {
      return { type, message };
    }
  } catch {
    return null;
  }

  return null;
}
