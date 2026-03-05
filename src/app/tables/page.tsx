"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTableApi } from "@/hooks/useTableApi";
import { fetchTablesByArea, generateQrSession } from "@/services/table.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { TableCard } from "@/components/tables/TableCard";
import { useAuth } from "@/contexts/AuthContext";
import { TableStatus } from "@/types";
import {
    ArrowLeft,
    LogOut,
    RefreshCw,
    Users,
    TableProperties,
    UtensilsCrossed,
    Clock,
    CreditCard,
    Download,
} from "lucide-react";

const statusFilters: { value: TableStatus | "all"; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "available", label: "Trống" },
    { value: "occupied", label: "Có khách" },
    { value: "waiting-food", label: "Chờ món" },
    { value: "waiting-payment", label: "Chờ thanh toán" },
];

export default function TablesPage() {
    const { user, logout, isAuthenticated } = useAuth();
    const [selectedTable, setSelectedTable] = useState<any | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [generatingQRFor, setGeneratingQRFor] = useState<string | null>(null);
    const pageSize = 10;

    const isWaiter = !!user?.areaId;

    // Area-based tables (waiter)
    const [areaTables, setAreaTables] = useState<any[]>([]);
    const [areaLoading, setAreaLoading] = useState(false);
    const [areaError, setAreaError] = useState<string | null>(null);

    const loadAreaTables = () => {
        if (!user?.areaId) return;
        setAreaLoading(true);
        fetchTablesByArea(user.areaId)
            .then((res) => setAreaTables(res.data))
            .catch((err) => setAreaError(err.message || "Không thể tải danh sách bàn"))
            .finally(() => setAreaLoading(false));
    };

    const handleDownloadQR = (base64: string, tableNumber: string) => {
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = `QR-Ban-${tableNumber}.png`;
        link.click();
    };

    const handleGenerateQR = async (tableId: string) => {
        setGeneratingQRFor(tableId);
        try {
            const res = await generateQrSession(tableId);
            const qrCodeBase64 = res.data.qrCodeBase64;
            setAreaTables((prev) =>
                prev.map((t) => t.id === tableId ? { ...t, qrCode: qrCodeBase64 } : t)
            );
            // Open dialog for this table to show the QR
            setSelectedTable((prev: any) =>
                prev?.id === tableId ? { ...prev, qrCode: qrCodeBase64 } : prev
            );
        } catch (err: any) {
            console.error("Không thể tạo QR Code:", err);
        } finally {
            setGeneratingQRFor(null);
        }
    };

    useEffect(() => {
        loadAreaTables();
    }, [user?.areaId]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadAreaTables();
        setTimeout(() => setRefreshing(false), 800);
    };

    // General paginated tables (admin/cashier)
    const { data, loading: apiLoading, error: apiError } = useTableApi(page, pageSize);

    // Normalize to a unified shape
    const allTables = isWaiter
        ? areaTables.map((t) => ({
              id: t.id,
              tableNumber: t.tableNumber,
              number: t.tableNumber,
              status: t.status,
              capacity: t.capacity,
              areaName: t.areaName,
              qrCode: t.qrCode,
              positionX: 0,
              positionY: 0,
          }))
        : (data?.data || []).map((t) => ({
              ...t,
              number: t.tableNumber,
              capacity: 0,
              positionX: 0,
              positionY: 0,
          }));

    const loading = isWaiter ? areaLoading : apiLoading;
    const error = isWaiter ? areaError : apiError;

    const filteredTables =
        filter === "all"
            ? allTables
            : allTables.filter((t) => t.status.toLowerCase() === filter);

    const statusCounts = {
        available: allTables.filter((t) => t.status.toLowerCase() === "available").length,
        occupied: allTables.filter((t) => t.status.toLowerCase() === "occupied").length,
        "waiting-food": allTables.filter((t) => t.status.toLowerCase() === "waiting-food").length,
        "waiting-payment": allTables.filter((t) => t.status.toLowerCase() === "waiting-payment").length,
    };

    const areaName = areaTables[0]?.areaName;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {isWaiter && (
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/waiter">
                                    <ArrowLeft size={18} />
                                </Link>
                            </Button>
                        )}
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                Quản lý bàn ăn
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {user ? `Xin chào, ${user.name}` : "Theo dõi và quản lý trạng thái bàn"}
                                {areaName && (
                                    <span className="ml-1 text-violet-600 dark:text-violet-400">— {areaName}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isWaiter && (
                            <Button variant="ghost" size="icon" onClick={handleRefresh} title="Làm mới">
                                <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
                            </Button>
                        )}
                        {isAuthenticated && (
                            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-gray-500 hover:text-red-600 px-3">
                                <LogOut size={15} />
                                <span>Đăng xuất</span>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: <TableProperties size={22} />, value: statusCounts.available, label: "Bàn trống", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                        { icon: <UtensilsCrossed size={22} />, value: statusCounts.occupied, label: "Có khách", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
                        { icon: <Clock size={22} />, value: statusCounts["waiting-food"], label: "Chờ món", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
                        { icon: <CreditCard size={22} />, value: statusCounts["waiting-payment"], label: "Chờ thanh toán", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
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

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                    {statusFilters.map((sf) => (
                        <button
                            key={sf.value}
                            onClick={() => setFilter(sf.value)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                filter === sf.value
                                    ? "bg-violet-600 text-white border-violet-600"
                                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400"
                            }`}
                        >
                            {sf.label}
                            {sf.value !== "all" && (
                                <span className="ml-1.5 opacity-70">
                                    ({sf.value === "available" ? statusCounts.available
                                      : sf.value === "occupied" ? statusCounts.occupied
                                      : sf.value === "waiting-food" ? statusCounts["waiting-food"]
                                      : statusCounts["waiting-payment"]})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Grid */}
                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Đang tải danh sách bàn...</div>
                ) : error ? (
                    <div className="text-center py-16 text-destructive">{error}</div>
                ) : filteredTables.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        Không có bàn nào phù hợp với bộ lọc đã chọn.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredTables.map((table) => (
                                <TableCard
                                    key={table.id}
                                    table={{
                                        ...table,
                                        status: table.status.toLowerCase() as TableStatus,
                                    }}
                                    showQR={!isWaiter}
                                    onClick={() => setSelectedTable(table)}
                                    onGenerateQR={isWaiter ? () => handleGenerateQR(table.id) : undefined}
                                    isGeneratingQR={generatingQRFor === table.id}
                                />
                            ))}
                        </div>

                        {/* Pagination — only for admin/cashier */}
                        {!isWaiter && (
                            <div className="flex justify-center items-center gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    disabled={page === 1 || loading}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Trang trước
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Trang {data?.pageNumber || 1} / {data?.totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={!data?.hasNextPage || loading}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Trang sau
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Table Detail Dialog */}
            <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Bàn {selectedTable?.tableNumber}</DialogTitle>
                        <DialogDescription>
                            {selectedTable?.areaName && `Khu vực: ${selectedTable.areaName}`}
                            {selectedTable?.capacity > 0 && ` — ${selectedTable.capacity} chỗ ngồi`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Trạng thái hiện tại</span>
                            <span className="font-medium capitalize">
                                {selectedTable?.status === "available" ? "Trống"
                                 : selectedTable?.status === "occupied" ? "Có khách"
                                 : selectedTable?.status === "waiting-food" ? "Chờ món"
                                 : selectedTable?.status === "waiting-payment" ? "Chờ thanh toán"
                                 : selectedTable?.status}
                            </span>
                        </div>
                        {selectedTable?.qrCode && (
                            <div className="flex flex-col items-center gap-3 pt-2">
                                <p className="text-xs text-muted-foreground">Mã QR</p>
                                <img
                                    src={`data:image/png;base64,${selectedTable.qrCode}`}
                                    alt={`QR Code bàn ${selectedTable.tableNumber}`}
                                    className="w-48 h-48 rounded-lg border"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => handleDownloadQR(selectedTable.qrCode, selectedTable.tableNumber)}
                                >
                                    <Download size={14} />
                                    Tải xuống
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTable(null)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

