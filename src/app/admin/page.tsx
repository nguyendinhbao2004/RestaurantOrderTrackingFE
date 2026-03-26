"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary, DashboardSummary } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/helpers";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDashboardSummary()
            .then((res) => setStats(res.data))
            .catch(() => setStats(null))
            .finally(() => setIsLoading(false));
    }, []);

    const statCards = [
        {
            title: "Tổng đơn hàng",
            value: isLoading ? "..." : String(stats?.totalOrders ?? 0),
            change: "+12%",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            ),
        },
        {
            title: "Tổng doanh thu",
            value: isLoading ? "..." : formatCurrency(stats?.totalRevenue ?? 0),
            change: "+8%",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <line x1="12" x2="12" y1="2" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
        },
        {
            title: "Giá trị TB / Đơn",
            value: isLoading ? "..." : formatCurrency(stats?.avgOrderValue ?? 0),
            change: "+5%",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                </svg>
            ),
        },
        {
            title: "Đơn chờ xử lý",
            value: isLoading ? "..." : String(stats?.pendingOrders ?? 0),
            change: null,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    <span className="text-orange-600">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">Tổng quan hoạt động nhà hàng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            {card.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{card.value}</div>
                            {card.change && (
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-emerald-600">{card.change}</span> so với tuần trước
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { href: "/admin/areas", label: "Quản lý khu vực", desc: "Thêm, sửa, xoá khu vực", color: "border-orange-200 bg-orange-50 dark:bg-orange-950/20" },
                    { href: "/admin/products", label: "Quản lý sản phẩm", desc: "Cập nhật thực đơn", color: "border-amber-200 bg-amber-50 dark:bg-amber-950/20" },
                    { href: "/admin/schedules", label: "Lịch làm việc", desc: "Phân ca, chấm công", color: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" },
                ].map((link) => (
                    <a key={link.href} href={link.href} className={`block p-4 rounded-xl border ${link.color} hover:opacity-80 transition-opacity`}>
                        <p className="font-semibold">{link.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}
