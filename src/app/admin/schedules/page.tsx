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
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    getSchedules, createSchedule, updateSchedule, deleteSchedule, ScheduleData,
} from "@/services/admin-schedule.service";
import { getAccounts } from "@/services/admin-account.service";

interface AccountOption { id: string; name: string; }

const STATUS_MAP: Record<string, string> = {
    Pending: "Chờ làm",
    Working: "Đang làm",
    Done: "Hoàn thành",
    Absent: "Vắng",
};
const STATUS_COLORS: Record<string, string> = {
    Pending: "bg-amber-500", Working: "bg-blue-500", Done: "bg-emerald-500", Absent: "bg-stone-400",
};

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<ScheduleData[]>([]);
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleData | null>(null);
    const [formData, setFormData] = useState({
        accountId: "", workDate: "", startTime: "", endTime: "", shiftName: "", note: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadSchedules = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await getSchedules({ pageIndex: page, pageSize: 10 });
            setSchedules(res.data ?? []);
            setHasNext(res.meta?.pagination?.hasNextPage ?? false);
            setHasPrev(res.meta?.pagination?.hasPreviousPage ?? false);
        } catch {
            setError("Không thể tải lịch làm việc.");
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => { loadSchedules(); }, [loadSchedules]);

    useEffect(() => {
        getAccounts(1, 100).then((r) => {
            setAccounts((r.data ?? []).map((a) => ({ id: a.id, name: a.name })));
        }).catch(() => {});
    }, []);

    const openCreate = () => {
        setEditingSchedule(null);
        setFormData({ accountId: accounts[0]?.id ?? "", workDate: "", startTime: "08:00", endTime: "16:00", shiftName: "Ca ngày", note: "" });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const openEdit = (s: ScheduleData) => {
        setEditingSchedule(s);
        setFormData({ accountId: s.accountId, workDate: s.workDate, startTime: s.startTime.slice(0, 5), endTime: s.endTime.slice(0, 5), shiftName: s.shiftName, note: s.note ?? "" });
        setFormError(null);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.accountId) { setFormError("Vui lòng chọn nhân viên."); return; }
        if (!formData.workDate) { setFormError("Vui lòng chọn ngày làm việc."); return; }
        if (!formData.shiftName.trim()) { setFormError("Tên ca không được để trống."); return; }
        setIsSaving(true);
        setFormError(null);
        try {
            if (editingSchedule) {
                await updateSchedule({ id: editingSchedule.id, ...formData });
            } else {
                await createSchedule(formData);
            }
            setIsDialogOpen(false);
            loadSchedules();
        } catch (e: unknown) {
            setFormError((e as { message?: string })?.message ?? "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteSchedule(deleteId);
            setDeleteId(null);
            loadSchedules();
        } catch {
            setDeleteId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold"><span className="text-orange-600">Lịch làm việc</span></h1>
                    <p className="text-muted-foreground">Quản lý ca làm việc và chấm công</p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
                    </svg>
                    Thêm ca làm
                </Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Danh sách ca làm việc</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8 text-muted-foreground">Đang tải...</div>}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-destructive mb-3">{error}</p>
                            <Button variant="outline" onClick={loadSchedules}>Thử lại</Button>
                        </div>
                    )}
                    {!isLoading && !error && schedules.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Chưa có lịch làm việc</p>
                            <Button onClick={openCreate} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">Tạo ca đầu tiên</Button>
                        </div>
                    )}
                    {!isLoading && !error && schedules.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nhân viên</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ngày</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ca làm</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Giờ vào / ra</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check-in</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Trạng thái</th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map((s) => (
                                            <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4 font-medium">{s.accountName}</td>
                                                <td className="py-3 px-4">{s.workDate}</td>
                                                <td className="py-3 px-4">{s.shiftName}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{s.startTime.slice(0,5)} – {s.endTime.slice(0,5)}</td>
                                                <td className="py-3 px-4">
                                                    {s.actualCheckIn ? (
                                                        <span className="text-emerald-600 text-xs">{s.actualCheckIn.slice(0, 5)}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge className={`${STATUS_COLORS[s.status] ?? "bg-stone-400"} text-white text-xs`}>
                                                        {STATUS_MAP[s.status] ?? s.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEdit(s)}>Sửa</Button>
                                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}>Xoá</Button>
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSchedule ? "Cập nhật ca làm" : "Thêm ca làm việc"}</DialogTitle>
                        <DialogDescription>{editingSchedule ? "Chỉnh sửa thông tin ca" : "Điền thông tin ca mới"}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Nhân viên <span className="text-destructive">*</span></label>
                            <select
                                value={formData.accountId}
                                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Chọn nhân viên...</option>
                                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Ngày làm việc <span className="text-destructive">*</span></label>
                            <Input type="date" value={formData.workDate} onChange={(e) => setFormData({ ...formData, workDate: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Giờ bắt đầu</label>
                                <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Giờ kết thúc</label>
                                <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tên ca <span className="text-destructive">*</span></label>
                            <Input value={formData.shiftName} onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })} placeholder="VD: Ca sáng, Ca tối..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Ghi chú</label>
                            <Input value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Ghi chú thêm..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Huỷ</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isSaving ? "Đang lưu..." : editingSchedule ? "Lưu thay đổi" : "Tạo ca làm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá ca làm</AlertDialogTitle>
                        <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
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
