"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    formatCurrency,
} from "@/lib/mock-data";

type Period = "daily" | "weekly" | "monthly";

export default function RevenuePage() {
    const [period, setPeriod] = useState<Period>("daily");

    const revenueData = {
        daily: dailyRevenue,
        weekly: weeklyRevenue,
        monthly: monthlyRevenue,
    };

    const currentData = revenueData[period];
    const totalRevenue = currentData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = currentData.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalRevenue / totalOrders;
    const maxRevenue = Math.max(...currentData.map((d) => d.revenue));

    const periodLabels = {
        daily: "Last 7 Days",
        weekly: "Last 4 Weeks",
        monthly: "Last 3 Months",
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        Revenue Analytics
                    </span>
                </h1>
                <p className="text-muted-foreground">
                    Track your restaurant&apos;s financial performance
                </p>
            </div>

            {/* Period Selector */}
            <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <TabsList>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>

                <TabsContent value={period} className="mt-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Revenue ({periodLabels[period]})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                                    {formatCurrency(totalRevenue)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {totalOrders}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Average Order Value
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(avgOrderValue)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue Chart (Bar Chart) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {currentData.slice(-10).map((data, index) => {
                                    const percentage = (data.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {new Date(data.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(data.revenue)}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Breakdown Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                                Date
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                                Orders
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                                Revenue
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                                Avg Order
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.slice(-10).reverse().map((data, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-border hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    {new Date(data.date).toLocaleDateString("en-US", {
                                                        weekday: "short",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </td>
                                                <td className="text-right py-3 px-4">{data.orders}</td>
                                                <td className="text-right py-3 px-4 font-medium text-violet-600 dark:text-violet-400">
                                                    {formatCurrency(data.revenue)}
                                                </td>
                                                <td className="text-right py-3 px-4">
                                                    {formatCurrency(data.revenue / data.orders)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
