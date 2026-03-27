"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTableApi } from "@/hooks/useTableApi";
import { fetchTablesByArea, generateQrSession, updateTableStatus, refreshQrSession } from "@/services/table.service";
import { createOrder, ApiOrderType } from "@/services/order.service";
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
    const [refreshingQRFor, setRefreshingQRFor] = useState<string | null>(null);
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
        const href = base64.startsWith("data:image") || base64.startsWith("http") 
            ? base64 
            : `data:image/png;base64,${base64}`;
        link.href = href;
        link.download = `QR-Ban-${tableNumber}.png`;
        link.click();
    };

    const handleGenerateQR = async (tableId: string) => {
        setGeneratingQRFor(tableId);
        try {
            const res = await generateQrSession(tableId);
            const qrCodeBase64 = res.data.qrCodeBase64;
            
            try {
                if (user?.id) {
                    try {
                        await createOrder({
                            tableId: tableId,
                            accountId: user.id,
                            orderType: ApiOrderType.DineIn
                        });
                    } catch (orderErr) {
                        console.error("Lỗi khi tạo order:", orderErr);
                    }
                }

                await updateTableStatus(tableId, "Reserved");
                alert("Thành công");
                
                setAreaTables((prev) =>
                    prev.map((t) => t.id === tableId ? { ...t, qrCode: qrCodeBase64, status: "reserved" } : t)
                );
                // Open dialog for this table to show the QR
                setSelectedTable((prev: any) =>
                    prev?.id === tableId ? { ...prev, qrCode: qrCodeBase64, status: "reserved" } : prev
                );
            } catch (statusErr) {
                alert("Lỗi hệ thống");
                
                // Fallback to updating QR code only without changing status locally
                setAreaTables((prev) =>
                    prev.map((t) => t.id === tableId ? { ...t, qrCode: qrCodeBase64 } : t)
                );
                setSelectedTable((prev: any) =>
                    prev?.id === tableId ? { ...prev, qrCode: qrCodeBase64 } : prev
                );
            }
        } catch (err: any) {
            console.error("Không thể tạo QR Code:", err);
            // Revert state if it fails
            setAreaTables((prev) =>
                prev.map((t) => t.id === tableId ? { ...t, status: "available" } : t)
            );
            setSelectedTable((prev: any) =>
                prev?.id === tableId ? { ...prev, status: "available" } : prev
            );
            alert("Lỗi khi tạo QR: " + (err.message || "Không xác định"));
        } finally {
            setGeneratingQRFor(null);
        }
    };

    const handleRefreshQR = async (tableId: string) => {
        setRefreshingQRFor(tableId);
        try {
            console.log("Calling refreshQrSession for table:", tableId);
            const res = await refreshQrSession(tableId);
            console.log("Refresh API response:", res);
            
            // Due to the Wrapper ApiResponse<T> in http-client, the data object is accessed via res.data
            // However, our TableCards and Table logic depends on extracting the base64 code that's inside res.data
            const qrCodeBase64 = (res as any)?.data?.qrCodeBase64 || (res as any)?.qrCodeBase64; 
            
            if (!qrCodeBase64 || qrCodeBase64 === "null") {
                console.warn("QR code received is empty or null string", qrCodeBase64);
                alert("QR Code không khả dụng từ máy chủ. Vui lòng thử lại sau.");
            }
            
            setAreaTables((prev) =>
                prev.map((t) => t.id === tableId ? { ...t, qrCode: qrCodeBase64 || null } : t)
            );
            setSelectedTable((prev: any) =>
                prev?.id === tableId ? { ...prev, qrCode: qrCodeBase64 || null } : prev
            );
        } catch (err: any) {
            console.error("Không thể tải lại QR Code:", err);
            alert("Lỗi khi tải lại QR: " + (err.message || "Không xác định"));
        } finally {
            setRefreshingQRFor(null);
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
    const { data, loading: apiLoading, error: apiError } = useTableApi(page, pageSize, !isWaiter);

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
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Header */}
            <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-40">
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
                            <h1 className="text-xl font-bold text-orange-600">
                                Quản lý bàn ăn
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {user ? `Xin chào, ${user.name}` : "Theo dõi và quản lý trạng thái bàn"}
                                {areaName && (
                                    <span className="ml-1 text-orange-600 dark:text-orange-400">— {areaName}</span>
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
                            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-stone-500 hover:text-red-600 px-3">
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
                        { icon: <UtensilsCrossed size={22} />, value: statusCounts.occupied, label: "Có khách", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
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
                                    ? "bg-orange-600 text-white border-orange-600"
                                    : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-400"
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
                                    onRefreshQR={isWaiter ? () => handleRefreshQR(table.id) : undefined}
                                    isRefreshingQR={refreshingQRFor === table.id}
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
                        {selectedTable?.qrCode && selectedTable.qrCode !== "null" && selectedTable.qrCode.length > 100 ? (
                            <div className="flex flex-col items-center gap-3 pt-2">
                                <p className="text-xs text-muted-foreground">Mã QR</p>
                                <img
                                    src={selectedTable.qrCode.startsWith("data:image") || selectedTable.qrCode.startsWith("http") ? selectedTable.qrCode : `data:image/png;base64,${selectedTable.qrCode}`}
                                    alt={`QR Code bàn ${selectedTable.tableNumber}`}
                                    className="w-48 h-48 rounded-lg border object-contain bg-white"
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
                        ) : (
                            selectedTable && selectedTable.status !== "available" && isWaiter && (
                                <div className="flex flex-col items-center gap-3 pt-2 mt-2">
                                    <p className="text-xs text-muted-foreground text-center">Bàn đang hoạt động nhưng chưa hiển thị mã QR.</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => handleRefreshQR(selectedTable.id)}
                                        disabled={refreshingQRFor === selectedTable.id}
                                    >
                                        <RefreshCw size={14} className={refreshingQRFor === selectedTable.id ? "animate-spin" : ""} />
                                        {refreshingQRFor === selectedTable.id ? "Đang tải..." : "Tải lại QR"}
                                    </Button>
                                </div>
                            )
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

