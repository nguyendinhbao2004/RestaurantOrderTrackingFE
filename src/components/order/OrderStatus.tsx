"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/helpers";

interface OrderStatusDisplayProps {
    order: Order | null;
}

const statusSteps: OrderStatus[] = ["pending", "cooking", "ready", "served"];

const statusConfig: Record<
    OrderStatus,
    { label: string; color: string; icon: React.ReactNode }
> = {
    pending: {
        label: "Pending",
        color: "bg-amber-500",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    cooking: {
        label: "Cooking",
        color: "bg-blue-500",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 12c0-3 2.5-6 2.5-6s2.5 3 2.5 6-2.5 6-2.5 6-2.5-3-2.5-6Z" />
                <path d="M6.5 12c0-3 2.5-6 2.5-6S12 9 12 12s-2.5 6-2.5 6-3-3-3-6Z" />
                <path d="M17.5 12c0-3 2.5-6 2.5-6S22 9 22 12s-2.5 6-2.5 6-2.5-3-2.5-6Z" />
                <path d="M2 22h20" />
            </svg>
        ),
    },
    ready: {
        label: "Ready",
        color: "bg-emerald-500",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    },
    served: {
        label: "Served",
        color: "bg-purple-500",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M2 12h20" />
                <path d="M12 2a4 4 0 0 0-4 4v6" />
                <path d="M12 2a4 4 0 0 1 4 4v6" />
                <path d="M4 22h16" />
                <path d="M12 12v10" />
            </svg>
        ),
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-rose-500",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
            </svg>
        ),
    },
};

export function OrderStatusDisplay({ order }: OrderStatusDisplayProps) {
    if (!order) {
        return null;
    }

    const currentStepIndex = statusSteps.indexOf(order.status);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order Status</CardTitle>
                    <Badge className={`${statusConfig[order.status].color} text-white`}>
                        {statusConfig[order.status].label}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Order #{order.id} • {formatDate(order.createdAt)}
                </p>
            </CardHeader>
            <CardContent>
                {/* Status Progress */}
                <div className="relative mb-6">
                    <div className="flex justify-between">
                        {statusSteps.map((status, index) => {
                            const isActive = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <div
                                    key={status}
                                    className="flex flex-col items-center relative z-10"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${isActive
                                                ? statusConfig[status].color
                                                : "bg-muted text-muted-foreground"
                                            } ${isCurrent ? "ring-4 ring-offset-2 ring-violet-500/30" : ""}`}
                                    >
                                        {statusConfig[status].icon}
                                    </div>
                                    <span
                                        className={`text-xs mt-2 ${isActive ? "font-medium" : "text-muted-foreground"
                                            }`}
                                    >
                                        {statusConfig[status].label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Progress line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                        <div
                            className="h-full bg-violet-500 transition-all duration-500"
                            style={{
                                width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Order Items</h4>
                    {order.items.map((item, index) => (
                        <div
                            key={index}
                            className="flex justify-between text-sm text-muted-foreground"
                        >
                            <span>
                                {item.quantity}x {item.menuItem.name}
                            </span>
                            <span>
                                {formatCurrency(item.menuItem.price * item.quantity)}
                            </span>
                        </div>
                    ))}
                    <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-violet-600 dark:text-violet-400">
                            {formatCurrency(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
