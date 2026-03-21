"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { getToken } from "@/lib/auth";

type RawPaymentMessage = {
  OrderId?: string;
  orderId?: string;
  OrderCode?: number;
  orderCode?: number;
  Amount?: number;
  amount?: number;
  PaymentMethod?: string;
  paymentMethod?: string;
  PaidAt?: string;
  paidAt?: string;
};

export type PaymentMessage = {
  orderId: string;
  orderCode: number;
  amount: number;
  paymentMethod: string;
  paidAt: string;
};

export type UsePaymentSuccessSignalROptions = {
  enabled?: boolean;
  subscribeOrderCodes?: number[];
  requireToken?: boolean;
};

function normalizeOrderCodes(orderCodes: number[] | undefined): number[] {
  if (!orderCodes || orderCodes.length === 0) return [];

  return Array.from(
    new Set(
      orderCodes
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Math.trunc(value)),
    ),
  );
}

function normalizePaymentMessage(raw: RawPaymentMessage): PaymentMessage {
  return {
    orderId: raw.orderId || raw.OrderId || "",
    orderCode: raw.orderCode ?? raw.OrderCode ?? 0,
    amount: raw.amount ?? raw.Amount ?? 0,
    paymentMethod: raw.paymentMethod || raw.PaymentMethod || "",
    paidAt: raw.paidAt || raw.PaidAt || "",
  };
}

export function usePaymentSuccessSignalR(
  onMessage: (message: PaymentMessage) => void,
  enabledOrOptions: boolean | UsePaymentSuccessSignalROptions = true,
) {
  const options =
    typeof enabledOrOptions === "boolean"
      ? { enabled: enabledOrOptions }
      : enabledOrOptions;

  const {
    enabled = true,
    subscribeOrderCodes = [],
    requireToken = false,
  } = options;

  const normalizedOrderCodes = useMemo(
    () => normalizeOrderCodes(subscribeOrderCodes),
    [subscribeOrderCodes],
  );
  const orderCodeSubscriptionKey = normalizedOrderCodes.join(",");

  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (!enabled || !baseUrl || typeof window === "undefined") return;

    const orderCodesToSubscribe = orderCodeSubscriptionKey
      ? orderCodeSubscriptionKey
          .split(",")
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0)
      : [];

    const getAccessToken =
      () => getToken() || localStorage.getItem("accessToken") || "";
    const initialAccessToken = getAccessToken();
    if (requireToken && !initialAccessToken) return;

    const connectionOptions: {
      accessTokenFactory?: () => string;
      transport: HttpTransportType;
    } = {
      transport: HttpTransportType.WebSockets,
    };

    if (initialAccessToken) {
      connectionOptions.accessTokenFactory = getAccessToken;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/restaurant`, connectionOptions)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    const handler = (raw: RawPaymentMessage) => {
      onMessageRef.current(normalizePaymentMessage(raw));
    };

    connection.on("NotifyPaymentSuccess", handler);

    void (async () => {
      try {
        await connection.start();

        for (const orderCode of orderCodesToSubscribe) {
          await connection.invoke("SubscribeOrderCode", orderCode);
        }
      } catch (error) {
        console.error("SignalR NotifyPaymentSuccess connection error:", error);
      }
    })();

    return () => {
      connection.off("NotifyPaymentSuccess", handler);
      void connection.stop().catch(() => {});
    };
  }, [enabled, orderCodeSubscriptionKey, requireToken]);
}
