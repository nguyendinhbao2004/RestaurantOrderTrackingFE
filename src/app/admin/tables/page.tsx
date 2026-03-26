"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    getAdminTables, createTable, updateTableInfo, updateTableStatus,
    AdminTableData,
} from "@/services/admin-table.service";
import { getAreas, AreaData } from "@/services/area.service";

type DialogMode = "create" | "edit" | "status";

const STATUS_OPTIONS = ["Available", "Occupied", "Reserved", "OutOfService"];
const STATUS_LABELS: Record<string, string> = {
    Available: "Trống", Occupied: "Đang dùng", Reserved: "Đặt trước", OutOfService: "Ngưng phục vụ",
};
const STATUS_COLORS: Record<string, string> = {
    Available: "bg-emerald-500", Occupied: "bg-orange-500", Reserved: "bg-blue-500", OutOfService: "bg-stone-400",
};

export default function TablesPage() {
    const [tables, setTables] = useState<AdminTableData[]>([]);
    const [areas, setAreas] = useState<AreaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<DialogMode>("create");
    const [editingTable, setEditingTable] = useState<AdminTableData | null>(null);
    const [formData, setFormData] = useState({ tableNumber: "", areaId: "", capacity: "4" });
    const [statusValue, setStatusValue] = useState("Available");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadTables = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await getAdminTables({ keyword: search, pageIndex: page, pageSize: 10 });
            setTables(res.data ?? []);
            setHasNext(res.meta?.pagination?.hasNextPage ?? false);
            setHasPrev(res.meta?.pagination?.hasPreviousPage ?? false);
        } catch {
            setError("Không thể tải danh sách bàn.");
        } finally {
            setIsLoading(false);
        }
    }, [search, page]);

    useEffect(() => { loadTables(); }, [loadTables]);
    useEffect(() => { getAreas().then((r) => setAreas(r.data ?? [])).catch(() => {}); }, []);

    const openCreate = () => {
        setDialogMode("create");
        setEditingTable(null);
        setFormData({ tableNumber: "", areaId: areas[0]?.id ?? "", capacity: "4" });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const openEdit = (t: AdminTableData) => {
        setDialogMode("edit");
        setEditingTable(t);
        setFormData({ tableNumber: t.tableNumber, areaId: "", capacity: String(t.capacity) });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const openStatus = (t: AdminTableData) => {
        setDialogMode("status");
        setEditingTable(t);
        setStatusValue(t.status);
        setFormError(null);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setFormError(null);
        try {
            if (dialogMode === "create") {
                if (!formData.tableNumber.trim()) { setFormError("Số bàn không được để trống."); setIsSaving(false); return; }
                if (!formData.areaId) { setFormError("Vui lòng chọn khu vực."); setIsSaving(false); return; }
                await createTable({ tableNumber: formData.tableNumber, areaId: formData.areaId, capacity: Number(formData.capacity) });
            } else if (dialogMode === "edit" && editingTable) {
                await updateTableInfo({ id: editingTable.id, tableNumber: formData.tableNumber, areaId: formData.areaId || editingTable.id, capacity: Number(formData.capacity) });
            } else if (dialogMode === "status" && editingTable) {
                await updateTableStatus({ id: editingTable.id, status: statusValue });
            }
            setIsDialogOpen(false);
            loadTables();
        } catch (e: unknown) {
            setFormError((e as { message?: string })?.message ?? "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    };

    const dialogTitle = dialogMode === "create" ? "Thêm bàn mới" : dialogMode === "edit" ? "Cập nhật bàn" : "Đổi trạng thái bàn";

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold"><span className="text-orange-600">Bàn ăn</span></h1>
                    <p className="text-muted-foreground">Quản lý bàn trong nhà hàng</p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
                    </svg>
                    Thêm bàn
                </Button>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATUS_OPTIONS.map((s) => {
                    const count = tables.filter((t) => t.status === s).length;
                    return (
                        <Card key={s} className="border-muted">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-sm text-muted-foreground">{STATUS_LABELS[s]}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <Input placeholder="Tìm bàn..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
            </div>

            <Card>
                <CardHeader><CardTitle>Danh sách bàn</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8 text-muted-foreground">Đang tải...</div>}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-destructive mb-3">{error}</p>
                            <Button variant="outline" onClick={loadTables}>Thử lại</Button>
                        </div>
                    )}
                    {!isLoading && !error && tables.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Không tìm thấy bàn nào</p>
                        </div>
                    )}
                    {!isLoading && !error && tables.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Số bàn</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Khu vực</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sức chứa</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Trạng thái</th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tables.map((t) => (
                                            <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4 font-semibold">{t.tableNumber}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{t.areaName}</td>
                                                <td className="py-3 px-4">{t.capacity} người</td>
                                                <td className="py-3 px-4">
                                                    <Badge className={`${STATUS_COLORS[t.status] ?? "bg-stone-400"} text-white`}>
                                                        {STATUS_LABELS[t.status] ?? t.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Sửa</Button>
                                                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => openStatus(t)}>Đổi trạng thái</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">Trang {page}</p>
                                <div className="flex gap-2">
                                    {hasPrev && <Button variant="outline" size="sm" onClick={() => setPage(page - 1)}>Trước</Button>}
                                    {hasNext && <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>Tiếp</Button>}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === "status" ? "Chọn trạng thái mới cho bàn" : dialogMode === "edit" ? "Chỉnh sửa thông tin bàn" : "Điền thông tin bàn mới"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                        {dialogMode !== "status" && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Số bàn <span className="text-destructive">*</span></label>
                                    <Input value={formData.tableNumber} onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })} placeholder="VD: A01, B12..." />
                                </div>
                                {dialogMode === "create" && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Khu vực <span className="text-destructive">*</span></label>
                                        <Select value={formData.areaId} onValueChange={(v) => setFormData({ ...formData, areaId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Chọn khu vực" /></SelectTrigger>
                                            <SelectContent>
                                                {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Sức chứa (người)</label>
                                    <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="4" min={1} max={20} />
                                </div>
                            </>
                        )}
                        {dialogMode === "status" && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Trạng thái</label>
                                <Select value={statusValue} onValueChange={setStatusValue}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Huỷ</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isSaving ? "Đang lưu..." : "Xác nhận"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
