"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { formatCurrency } from "@/lib/helpers";
import { fetchTablesByArea } from "@/services/table.service";
import { AreaApiTable } from "@/types";
import {
  CheckCircle2,
  ClipboardList,
  TableProperties,
  UtensilsCrossed,
  LogOut,
  RefreshCw,
  Users,
  ChevronRight,
} from "lucide-react";

export default function WaiterPage() {
  const { user, logout } = useAuth();
  const { orders, updateOrderStatus } = useOrder();

  const [tables, setTables] = useState<AreaApiTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTables = () => {
    if (!user?.areaId) return;
    setTablesLoading(true);
    fetchTablesByArea(user.areaId)
      .then((res) => setTables(res.data))
      .catch((err) => console.error("Failed to load area tables:", err))
      .finally(() => setTablesLoading(false));
  };

  useEffect(() => {
    loadTables();
  }, [user?.areaId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    loadTables();
    setTimeout(() => setRefreshing(false), 800);
  };

  const readyOrders = orders.filter((o) => o.status === "ready");
  const activeOrders = orders.filter(
    (o) => o.status !== "served" && o.status !== "cancelled",
  );
  const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
  const availableCount = tables.filter((t) => t.status === "Available").length;

  const handleServe = (orderId: string) => {
    updateOrderStatus(orderId, "served");
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "Available":
        return { card: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" };
      case "Occupied":
        return { card: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" };
      default:
        return { card: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" };
    }
  };

  const areaName = tables[0]?.areaName ?? "Khu vực của bạn";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-xl select-none shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-base text-gray-900 dark:text-gray-100 leading-tight">
                {user?.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <Users size={12} />
                {areaName}
              </p>
            </div>
          </div>

          <h1 className="hidden md:block text-xl font-bold text-violet-600">
            Bảng điều khiển nhân viên
          </h1>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh} title="Làm mới">
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-1.5 px-3 h-9">
              <Link href="/tables">
                <TableProperties size={15} />
                <span>Xem bàn</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-gray-500 hover:text-red-600 px-3 h-9">
              <LogOut size={15} />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <CheckCircle2 size={22} />, value: readyOrders.length, label: "Sẵn sàng phục vụ", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: <ClipboardList size={22} />, value: activeOrders.length, label: "Đơn đang hoạt động", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
            { icon: <UtensilsCrossed size={22} />, value: occupiedCount, label: "Bàn đang có khách", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
            { icon: <TableProperties size={22} />, value: availableCount, label: "Bàn trống", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
          ].map(({ icon, value, label, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`${bg} ${color} p-3 rounded-xl shrink-0`}>{icon}</div>
                <div>
                  <div className={`text-3xl font-bold ${color}`}>{value}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Ready to Serve */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Sẵn sàng phục vụ
              </h2>
              {readyOrders.length > 0 && (
                <Badge className="bg-emerald-500 text-white">{readyOrders.length}</Badge>
              )}
            </div>

            {readyOrders.length === 0 ? (
              <Card className="border-dashed border-gray-200 dark:border-gray-800 shadow-none">
                <CardContent className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                  <CheckCircle2 size={36} className="opacity-25" />
                  <p className="text-sm">Không có đơn nào sẵn sàng phục vụ</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {readyOrders.map((order) => (
                  <Card key={order.id} className="border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
                    <div className="h-1 bg-emerald-500" />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                          Bàn {order.tableId}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0 text-xs">
                          READY
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Đơn số #{order.id.slice(0, 8)}
                      </p>
                      <ul className="space-y-1 mb-4 text-sm text-gray-700 dark:text-gray-300">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <ChevronRight size={13} className="text-muted-foreground shrink-0" />
                            <span>{item.quantity}× {item.menuItem.name}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleServe(order.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 size={15} className="mr-2" />
                        Đánh dấu đã phục vụ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Table Overview */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <TableProperties size={17} className="text-blue-500 shrink-0" />
                Tổng quan bàn ăn
                {tables[0]?.areaName && (
                  <span className="text-sm font-normal text-muted-foreground">— {tables[0].areaName}</span>
                )}
              </h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Trống</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Có khách</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Khác</span>
              </div>
            </div>

            {tablesLoading ? (
              <Card className="shadow-none border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Đang tải danh sách bàn...
                </CardContent>
              </Card>
            ) : tables.length === 0 ? (
              <Card className="shadow-none border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Không tìm thấy bàn nào trong khu vực của bạn
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {tables.map((table) => {
                  const s = statusStyle(table.status);
                  return (
                    <div
                      key={table.tableNumber}
                      className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md cursor-default ${s.card}`}
                    >
                      <div className="text-base font-bold text-gray-800 dark:text-gray-100">
                        {table.tableNumber}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                        <span className={`text-xs font-semibold ${s.text}`}>
                          {table.status === "Available" ? "Trống" : table.status === "Occupied" ? "Có khách" : table.status}
                        </span>
                      </div>
                      {table.capacity > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users size={11} />
                          <span>{table.capacity} chỗ</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

