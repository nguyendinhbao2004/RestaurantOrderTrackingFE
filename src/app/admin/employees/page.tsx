"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { getAccounts, createAccount, AccountListItem } from "@/services/admin-account.service";
import { getAreas } from "@/services/area.service";

const ROLE_OPTIONS = [
    { label: "Admin", value: 1 },
    { label: "Waiter", value: 2 },
    { label: "Chef", value: 3 },
    { label: "Head Chef", value: 4 },
    { label: "Cashier", value: 5 },
];

const ROLE_COLORS: Record<string, string> = {
    Admin: "bg-orange-500",
    Waiter: "bg-amber-500",
    Chef: "bg-orange-400",
    HeadChef: "bg-red-500",
    Cashier: "bg-emerald-500",
};


export default function EmployeesPage() {
    const [employees, setEmployees] = useState<AccountListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [search, setSearch] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<any>({
        userName: "", fullName: "", phone: "", password: "", image: "", roleId: "2",
        skillLevel: "", specialty: "", areaId: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);

    // Lấy danh sách khu vực khi mở dialog và chọn waiter
    useEffect(() => {
        if (isDialogOpen && formData.roleId === "2") {
            getAreas().then(res => {
                setAreas(res.data || []);
            });
        }
    }, [isDialogOpen, formData.roleId]);

    const loadEmployees = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await getAccounts(page, 10, search);
            setEmployees(res.data ?? []);
            setHasNext(res.meta?.pagination?.hasNextPage ?? false);
            setHasPrev(res.meta?.pagination?.hasPreviousPage ?? false);
        } catch {
            setError("Không thể tải danh sách nhân viên.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadEmployees(); }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

    const openCreate = () => {
        setFormData({ userName: "", fullName: "", phone: "", password: "", image: "", roleId: "2", skillLevel: "", specialty: "", areaId: "" });
        setFormError(null);
        setSuccessMsg(null);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.userName.trim()) { setFormError("Tên tài khoản không được để trống."); return; }
        if (!formData.fullName.trim()) { setFormError("Họ tên không được để trống."); return; }
        if (!formData.password) { setFormError("Mật khẩu không được để trống."); return; }
        if (!formData.phone.trim()) { setFormError("Số điện thoại không được để trống."); return; }
        // Validate theo role
        if (formData.roleId === "2" && !formData.areaId) { setFormError("Vui lòng chọn khu vực cho nhân viên phục vụ."); return; }
        if (formData.roleId === "3" && !formData.specialty) { setFormError("Vui lòng chọn chuyên môn cho đầu bếp."); return; }
        if ((formData.roleId === "3" || formData.roleId === "4") && !formData.skillLevel) { setFormError("Vui lòng nhập trình độ kỹ năng cho bếp."); return; }

        setIsSaving(true);
        setFormError(null);
        try {
            // Tùy role gửi đúng data và gọi API khác nhau
            let payload: any = {};
            const roleId = Number(formData.roleId);

            if (roleId === 1 || roleId === 5) {
                // Admin, Cashier
                payload = {
                    userName: formData.userName,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    password: formData.password,
                    image: "",
                    roleId: roleId,
                };
            } else if (roleId === 3) {
                // Chef
                payload = {
                    userName: formData.userName,
                    fullName: formData.fullName,
                    img: "",
                    phone: formData.phone,
                    password: formData.password,
                    specialty: Number(formData.specialty),
                    skillLevel: formData.skillLevel,
                };
            } else if (roleId === 4) {
                // Head Chef
                payload = {
                    userName: formData.userName,
                    fullName: formData.fullName,
                    img: "",
                    phone: formData.phone,
                    password: formData.password,
                    skillLevel: formData.skillLevel,
                };
            } else if (roleId === 2) {
                // Waiter
                payload = {
                    userName: formData.userName,
                    fullName: formData.fullName,
                    img: "",
                    phone: formData.phone,
                    password: formData.password,
                    areaId: formData.areaId,
                };
            }
            console.log("Creating account with roleId:", roleId, "payload:", payload);
            // Pass roleId to createAccount so it calls the correct API endpoint
            await createAccount(payload, roleId);
            setSuccessMsg(`Đã tạo tài khoản ${formData.fullName} thành công!`);
            setFormData({ userName: "", fullName: "", phone: "", password: "", image: "", roleId: "2", skillLevel: "", specialty: "", areaId: "" });
            loadEmployees();
        } catch (e: unknown) {
            console.error("Error creating account:", e);
            const errorMsg = (e as any)?.message || (e as any)?.data?.message || "Có lỗi xảy ra khi tạo tài khoản.";
            setFormError(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const roleCounts = ROLE_OPTIONS.reduce((acc, r) => {
        acc[r.label] = employees.filter((e) => e.roleName === r.label).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold"><span className="text-orange-600">Nhân viên</span></h1>
                    <p className="text-muted-foreground">Quản lý tài khoản và nhân sự nhà hàng</p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" x2="19" y1="8" y2="14" />
                        <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                    Thêm nhân viên
                </Button>
            </div>

            {/* Role Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ROLE_OPTIONS.map((r) => (
                    <Card key={r.label} className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{roleCounts[r.label] ?? 0}</div>
                            <div className="text-sm text-muted-foreground">{r.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Input placeholder="Tìm nhân viên..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />

            {/* Employee List */}
            <Card>
                <CardHeader><CardTitle>Danh sách nhân viên ({employees.length})</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8 text-muted-foreground">Đang tải...</div>}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-destructive mb-3">{error}</p>
                            <Button variant="outline" onClick={loadEmployees}>Thử lại</Button>
                        </div>
                    )}
                    {!isLoading && !error && employees.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Không tìm thấy nhân viên</p>
                        </div>
                    )}
                    {!isLoading && !error && employees.length > 0 && (
                        <>
                            <div className="space-y-3">
                                {employees.map((emp) => (
                                    <div key={emp.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                                                {emp.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? emp.userName[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium">{emp.name}</p>
                                                <Badge className={`${ROLE_COLORS[emp.roleName] ?? "bg-stone-400"} text-white text-xs`}>
                                                    {emp.roleName}
                                                </Badge>
                                                {!emp.isActive && <Badge variant="outline" className="text-xs text-muted-foreground">Vô hiệu hóa</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">@{emp.userName}</p>
                                        </div>
                                    </div>
                                ))}
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

            {/* Create Account Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm nhân viên mới</DialogTitle>
                        <DialogDescription>Tạo tài khoản cho nhân viên mới</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {formError && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{formError}</p>}
                        {successMsg && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded p-2">{successMsg}</p>}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tên đăng nhập <span className="text-destructive">*</span></label>
                                <Input value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} placeholder="waiter01" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Họ và tên <span className="text-destructive">*</span></label>
                                <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nguyễn Văn A" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Số điện thoại <span className="text-destructive">*</span></label>
                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0901234567" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Mật khẩu <span className="text-destructive">*</span></label>
                                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Vai trò <span className="text-destructive">*</span></label>
                            <Select value={formData.roleId} onValueChange={(v) => setFormData({ ...formData, roleId: v })}>
                                <SelectTrigger><SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((r) => <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Trường riêng cho Chef */}
                        {formData.roleId === "3" && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Trình độ kỹ năng <span className="text-destructive">*</span></label>
                                    <Input value={formData.skillLevel} onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })} placeholder="VD: Cao, Trung bình, ..." />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Chuyên môn <span className="text-destructive">*</span></label>
                                    <Select value={formData.specialty} onValueChange={(v) => setFormData({ ...formData, specialty: v })}>
                                        <SelectTrigger><SelectValue placeholder="Chọn chuyên môn" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">Món Á</SelectItem>
                                            <SelectItem value="3">Món Tây</SelectItem>
                                            <SelectItem value="4">Phụ bếp</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                        {/* Trường riêng cho Head Chef */}
                        {formData.roleId === "4" && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Trình độ kỹ năng <span className="text-destructive">*</span></label>
                                <Input value={formData.skillLevel} onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })} placeholder="VD: Cao, Trung bình, ..." />
                            </div>
                        )}
                        {/* Trường riêng cho Waiter */}
                        {formData.roleId === "2" && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Khu vực phục vụ <span className="text-destructive">*</span></label>
                                <Select value={formData.areaId} onValueChange={(v) => setFormData({ ...formData, areaId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Chọn khu vực" /></SelectTrigger>
                                    <SelectContent>
                                        {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Đóng</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isSaving ? "Đang tạo..." : "Tạo tài khoản"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
