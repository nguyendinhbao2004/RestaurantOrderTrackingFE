"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    getCategories, createCategory, updateCategory, deleteCategory, CategoryData,
} from "@/services/admin-category.service";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<CategoryData | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", imageUrl: "", isActive: true });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await getCategories();
            setCategories(res.data ?? []);
        } catch {
            setError("Không thể tải danh mục.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadCategories(); }, [loadCategories]);

    const openCreate = () => {
        setEditingCat(null);
        setFormData({ name: "", description: "", imageUrl: "", isActive: true });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const openEdit = (cat: CategoryData) => {
        setEditingCat(cat);
        setFormData({ name: cat.name, description: cat.description, imageUrl: cat.imageUrl ?? "", isActive: cat.isActive });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { setFormError("Tên danh mục không được để trống."); return; }
        setIsSaving(true);
        setFormError(null);
        try {
            if (editingCat) {
                await updateCategory({ id: editingCat.id, ...formData });
            } else {
                await createCategory({ name: formData.name, description: formData.description, imageUrl: formData.imageUrl || undefined });
            }
            setIsDialogOpen(false);
            loadCategories();
        } catch (e: unknown) {
            setFormError((e as { message?: string })?.message ?? "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        setIsDeleting(true);
        try {
            await deleteCategory(deleteId);
            setDeleteId(null);
            loadCategories();
        } catch {
            setDeleteId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const activeCount = categories.filter((c) => c.isActive).length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold"><span className="text-orange-600">Danh mục</span></h1>
                    <p className="text-muted-foreground">Quản lý danh mục món ăn</p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
                    </svg>
                    Thêm danh mục
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
                        <div className="text-sm text-muted-foreground">Tổng danh mục</div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
                        <div className="text-sm text-muted-foreground">Đang hoạt động</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Danh sách danh mục ({categories.length})</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8 text-muted-foreground">Đang tải...</div>}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-destructive mb-3">{error}</p>
                            <Button variant="outline" onClick={loadCategories}>Thử lại</Button>
                        </div>
                    )}
                    {!isLoading && !error && categories.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Chưa có danh mục nào</p>
                            <Button onClick={openCreate} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">Tạo danh mục đầu tiên</Button>
                        </div>
                    )}
                    {!isLoading && !error && categories.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ảnh</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tên danh mục</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mô tả</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Trạng thái</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">
                                                {cat.imageUrl ? (
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted">
                                                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                        <span className="text-orange-600 font-bold text-sm">{cat.name[0]}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-medium">{cat.name}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{cat.description || "—"}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={cat.isActive ? "bg-emerald-500 text-white" : "bg-stone-400 text-white"}>
                                                    {cat.isActive ? "Hoạt động" : "Ẩn"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(cat)}>Sửa</Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(cat.id)}>Xoá</Button>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCat ? "Cập nhật danh mục" : "Thêm danh mục mới"}</DialogTitle>
                        <DialogDescription>{editingCat ? "Chỉnh sửa thông tin danh mục" : "Điền thông tin danh mục mới"}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tên danh mục <span className="text-destructive">*</span></label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Món chính, Tráng miệng..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Mô tả</label>
                            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả danh mục..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">URL ảnh</label>
                            <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        {editingCat && (
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Hiển thị danh mục</label>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Huỷ</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isSaving ? "Đang lưu..." : editingCat ? "Lưu thay đổi" : "Tạo danh mục"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá danh mục</AlertDialogTitle>
                        <AlertDialogDescription>Hành động này không thể hoàn tác. Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.</AlertDialogDescription>
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
