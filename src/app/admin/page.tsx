"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/helpers";
import { Order, DashboardStats, PopularDish } from "@/types";

const dashboardStats: DashboardStats = {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    tablesOccupied: 0,
    pendingOrders: 0,
};

const popularDishes: PopularDish[] = [];
const orders: Order[] = [];

export default function AdminDashboardPage() {
    const recentOrders = orders.slice(-5).reverse();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    <span className="text-orange-600">
                        Dashboard
                    </span>
                </h1>
                <p className="text-muted-foreground">
                    Overview of your restaurant performance
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
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
                            className="text-muted-foreground"
                        >
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{dashboardStats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600">+12%</span> from last week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
                            className="text-muted-foreground"
                        >
                            <line x1="12" x2="12" y1="2" y2="22" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {formatCurrency(dashboardStats.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600">+8%</span> from last week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
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
                            className="text-muted-foreground"
                        >
                            <path d="M3 3v18h18" />
                            <path d="m19 9-5 5-4-4-3 3" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {formatCurrency(dashboardStats.averageOrderValue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600">+5%</span> from last week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
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
                            className="text-muted-foreground"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{dashboardStats.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardStats.tablesOccupied} tables occupied
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Dishes & Recent Orders */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Popular Dishes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Popular Dishes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {popularDishes.map((dish: PopularDish, index: number) => (
                                <div
                                    key={dish.menuItem.id}
                                    className="flex items-center gap-4"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{dish.menuItem.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {dish.orderCount} orders
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-orange-600 dark:text-orange-400">
                                            {formatCurrency(dish.revenue)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.map((order: Order) => (
                                <div key={order.id} className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">Order #{order.id}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <Badge
                                        className={`${getOrderStatusColor(order.status)} text-white`}
                                    >
                                        {order.status}
                                    </Badge>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatCurrency(order.totalAmount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
