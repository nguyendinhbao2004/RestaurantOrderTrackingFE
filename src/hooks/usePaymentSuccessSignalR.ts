"use client";

import { useEffect, useRef } from "react";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { getToken } from "@/lib/auth";

type RawPaymentMessage = {
  OrderId?: string;
  orderId?: string;
  Amount?: number;
  amount?: number;
  PaymentMethod?: string;
  paymentMethod?: string;
  PaidAt?: string;
  paidAt?: string;
};

export type PaymentMessage = {
  orderId: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
};

function normalizePaymentMessage(raw: RawPaymentMessage): PaymentMessage {
  return {
    orderId: raw.orderId || raw.OrderId || "",
    amount: raw.amount ?? raw.Amount ?? 0,
    paymentMethod: raw.paymentMethod || raw.PaymentMethod || "",
    paidAt: raw.paidAt || raw.PaidAt || "",
  };
}

export function usePaymentSuccessSignalR(
  onMessage: (message: PaymentMessage) => void,
  enabled = true,
) {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (!enabled || !baseUrl || typeof window === "undefined") return;

    const getAccessToken = () =>
      getToken() || localStorage.getItem("accessToken") || "";

    if (!getAccessToken()) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/restaurant`, {
        accessTokenFactory: getAccessToken,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    const handler = (raw: RawPaymentMessage) => {
      onMessageRef.current(normalizePaymentMessage(raw));
    };

    connection.on("NotifyPaymentSuccess", handler);
    void connection.start().catch((error) => {
      console.error("SignalR NotifyPaymentSuccess connection error:", error);
    });

    return () => {
      connection.off("NotifyPaymentSuccess", handler);
      void connection.stop().catch(() => {});
    };
  }, [enabled]);
}
