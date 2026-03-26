"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    getAreas, createArea, updateArea, deleteArea, AreaData,
} from "@/services/area.service";

export default function AreasPage() {
    const [areas, setAreas] = useState<AreaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaData | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadAreas = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await getAreas();
            setAreas(res.data ?? []);
        } catch {
            setError("Không thể tải danh sách khu vực.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadAreas(); }, [loadAreas]);

    const openCreate = () => {
        setEditingArea(null);
        setFormData({ name: "", description: "" });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const openEdit = (area: AreaData) => {
        setEditingArea(area);
        setFormData({ name: area.name, description: area.description });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { setFormError("Tên khu vực không được để trống."); return; }
        setIsSaving(true);
        setFormError(null);
        try {
            if (editingArea) {
                await updateArea({ id: editingArea.id, ...formData });
            } else {
                await createArea(formData);
            }
            setIsDialogOpen(false);
            loadAreas();
        } catch (e: unknown) {
            const msg = (e as { message?: string })?.message ?? "Có lỗi xảy ra.";
            setFormError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteArea(deleteId);
            setDeleteId(null);
            loadAreas();
        } catch {
            setDeleteId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold"><span className="text-orange-600">Khu vực</span></h1>
                    <p className="text-muted-foreground">Quản lý các khu vực trong nhà hàng</p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
                    </svg>
                    Thêm khu vực
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{areas.length}</div>
                        <div className="text-sm text-muted-foreground">Tổng khu vực</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách khu vực ({areas.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8 text-muted-foreground">Đang tải...</div>}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-destructive mb-3">{error}</p>
                            <Button variant="outline" onClick={loadAreas}>Thử lại</Button>
                        </div>
                    )}
                    {!isLoading && !error && areas.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Chưa có khu vực nào</p>
                            <Button onClick={openCreate} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">Tạo khu vực đầu tiên</Button>
                        </div>
                    )}
                    {!isLoading && !error && areas.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tên khu vực</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mô tả</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {areas.map((area) => (
                                        <tr key={area.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 font-medium">{area.name}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{area.description || "—"}</td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(area)}>Sửa</Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(area.id)}>Xoá</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingArea ? "Cập nhật khu vực" : "Thêm khu vực mới"}</DialogTitle>
                        <DialogDescription>{editingArea ? "Chỉnh sửa thông tin khu vực" : "Điền thông tin khu vực mới"}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tên khu vực <span className="text-destructive">*</span></label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Tầng 1, Khu VIP..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Mô tả</label>
                            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả khu vực..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Huỷ</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isSaving ? "Đang lưu..." : editingArea ? "Lưu thay đổi" : "Tạo khu vực"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá khu vực</AlertDialogTitle>
                        <AlertDialogDescription>Hành động này không thể hoàn tác. Toàn bộ dữ liệu liên quan có thể bị ảnh hưởng.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Huỷ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-white hover:bg-destructive/90">
                            {isDeleting ? "Đang xoá..." : "Xoá"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
