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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    getAdminProducts, createProduct, updateProductInfo, toggleProductStatus,
    AdminProductData,
} from "@/services/admin-product.service";
import { getCategories, CategoryData } from "@/services/admin-category.service";
import { formatCurrency } from "@/lib/helpers";

type DialogMode = "create" | "edit";

export default function ProductsPage() {
    const [products, setProducts] = useState<AdminProductData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<DialogMode>("create");
    const [editingProduct, setEditingProduct] = useState<AdminProductData | null>(null);
    const [formData, setFormData] = useState({
        name: "", description: "", price: "", imageUrl: "", categoryId: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await getAdminProducts({ keyword: search, pageIndex: page, pageSize: 10 });
            setProducts(res.data ?? []);
            setHasNext(res.meta?.pagination?.hasNextPage ?? false);
            setHasPrev(res.meta?.pagination?.hasPreviousPage ?? false);
        } catch {
            setError("Không thể tải danh sách sản phẩm.");
        } finally {
            setIsLoading(false);
        }
    }, [search, page]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    useEffect(() => {
        getCategories().then((r) => setCategories(r.data ?? [])).catch(() => {});
    }, []);

    const openCreate = () => {
        setDialogMode("create");
        setEditingProduct(null);
        setFormData({ name: "", description: "", price: "", imageUrl: "", categoryId: categories[0]?.id?.toString() ?? "" });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const openEdit = (p: AdminProductData) => {
        setDialogMode("edit");
        setEditingProduct(p);
        setFormData({ name: p.name, description: p.description ?? "", price: String(p.price), imageUrl: p.imageUrl ?? "", categoryId: "" });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { setFormError("Tên sản phẩm không được để trống."); return; }
        if (!formData.price || isNaN(Number(formData.price))) { setFormError("Giá không hợp lệ."); return; }
        setIsSaving(true);
        setFormError(null);
        try {
            if (dialogMode === "edit" && editingProduct) {
                await updateProductInfo({ id: editingProduct.id, name: formData.name, price: Number(formData.price), description: formData.description });
            } else {
                if (!formData.categoryId) { setFormError("Vui lòng chọn danh mục."); setIsSaving(false); return; }
                await createProduct({ name: formData.name, description: formData.description, price: Number(formData.price), imageUrl: formData.imageUrl || undefined, categoryId: Number(formData.categoryId) });
            }
            setIsDialogOpen(false);
            loadProducts();
        } catch (e: unknown) {
            setFormError((e as { message?: string })?.message ?? "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleProductStatus(id);
            loadProducts();
        } catch { /* silent */ }
    };

    const isActive = (p: AdminProductData) => {
        if (typeof p.isActive === "boolean") return p.isActive;
        return String(p.isActive).toLowerCase() === "true";
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold"><span className="text-orange-600">Sản phẩm</span></h1>
                    <p className="text-muted-foreground">Quản lý menu và sản phẩm nhà hàng</p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
                    </svg>
                    Thêm sản phẩm
                </Button>
            </div>

            {/* Search */}
            <div className="flex gap-3">
                <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="max-w-sm"
                />
            </div>

            <Card>
                <CardHeader><CardTitle>Danh sách sản phẩm</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8 text-muted-foreground">Đang tải...</div>}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-destructive mb-3">{error}</p>
                            <Button variant="outline" onClick={loadProducts}>Thử lại</Button>
                        </div>
                    )}
                    {!isLoading && !error && products.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
                        </div>
                    )}
                    {!isLoading && !error && products.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ảnh</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tên sản phẩm</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Danh mục</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Giá</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Trạng thái</th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => (
                                            <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4">
                                                    {p.imageUrl ? (
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted">
                                                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                            <span className="text-orange-600 font-bold text-xs">{p.name[0]}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium">{p.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</p>
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground">{p.categoryName}</td>
                                                <td className="py-3 px-4 font-semibold text-orange-600">{formatCurrency(p.price)}</td>
                                                <td className="py-3 px-4">
                                                    <Badge className={isActive(p) ? "bg-emerald-500 text-white" : "bg-stone-400 text-white"}>
                                                        {isActive(p) ? "Đang bán" : "Tạm ngưng"}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Sửa</Button>
                                                        <Button variant="ghost" size="sm" className={isActive(p) ? "text-stone-500" : "text-emerald-600"} onClick={() => handleToggleStatus(p.id)}>
                                                            {isActive(p) ? "Tắt" : "Bật"}
                                                        </Button>
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
                        <DialogTitle>{dialogMode === "edit" ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                        <DialogDescription>{dialogMode === "edit" ? "Chỉnh sửa thông tin sản phẩm" : "Điền thông tin sản phẩm mới"}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tên sản phẩm <span className="text-destructive">*</span></label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Bò lúc lắc, Cơm gà..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Mô tả</label>
                            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả sản phẩm..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Giá (VNĐ) <span className="text-destructive">*</span></label>
                            <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="120000" />
                        </div>
                        {dialogMode === "create" && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">URL ảnh</label>
                                    <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Danh mục <span className="text-destructive">*</span></label>
                                    <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Huỷ</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isSaving ? "Đang lưu..." : dialogMode === "edit" ? "Lưu thay đổi" : "Tạo sản phẩm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
