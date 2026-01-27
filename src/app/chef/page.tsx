"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { getOrderStatusColor, formatDate, formatCurrency } from "@/lib/mock-data";
import { OrderStatus } from "@/types";

const statusFlow: OrderStatus[] = ["pending", "cooking", "ready"];

export default function ChefPage() {
    const { user, logout } = useAuth();
    const { orders, updateOrderStatus } = useOrder();

    // Filter orders that chefs care about (pending and cooking)
    const activeOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "cooking"
    );
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const cookingOrders = orders.filter((o) => o.status === "cooking");

    const handleStatusUpdate = (orderId: string, currentStatus: OrderStatus) => {
        const currentIndex = statusFlow.indexOf(currentStatus);
        if (currentIndex < statusFlow.length - 1) {
            updateOrderStatus(orderId, statusFlow[currentIndex + 1]);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background dark:from-orange-950/20 dark:to-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/login">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m12 19-7-7 7-7" />
                                        <path d="M19 12H5" />
                                    </svg>
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                        Kitchen Dashboard
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Welcome, Chef {user?.name?.split(" ")[0]}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={logout}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" x2="9" y1="12" y2="12" />
                            </svg>
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-amber-500/10 border-amber-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                {pendingOrders.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Pending</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {cookingOrders.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Cooking</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {orders.filter((o) => o.status === "ready").length}
                            </div>
                            <div className="text-sm text-muted-foreground">Ready</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-violet-500/10 border-violet-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                                {orders.filter((o) => o.status === "served").length}
                            </div>
                            <div className="text-sm text-muted-foreground">Served Today</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Queue */}
                <h2 className="text-xl font-bold mb-4">Order Queue</h2>

                {activeOrders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <p>No active orders!</p>
                            <p className="text-sm">All caught up for now.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeOrders.map((order) => (
                            <Card key={order.id} className={`${order.status === "pending" ? "border-amber-500/50 bg-amber-500/5" : "border-blue-500/50 bg-blue-500/5"}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                        <Badge className={`${getOrderStatusColor(order.status)} text-white`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Table {order.tableId} • {formatDate(order.createdAt)}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="font-medium">
                                                    {item.quantity}x {item.menuItem.name}
                                                </span>
                                                {item.notes && (
                                                    <span className="text-muted-foreground italic text-xs">
                                                        {item.notes}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={() => handleStatusUpdate(order.id, order.status)}
                                        className={`w-full ${order.status === "pending"
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "bg-emerald-600 hover:bg-emerald-700"
                                            } text-white`}
                                    >
                                        {order.status === "pending" ? "Start Cooking" : "Mark Ready"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
