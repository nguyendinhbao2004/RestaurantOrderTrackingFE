"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { httpClient, type Pagination } from "@/lib/http-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock3, ChefHat, UserCheck, X, Check, CheckCircle2 } from "lucide-react";
import {
  getConfirmedOrderItems,
  getAvailableChefs,
  assignChef,
  type ConfirmedOrderItem,
  type AvailableChef,
} from "@/services/head-chef.service";

// ==================== CONSTANTS ====================

const PAGE_SIZE = 10;

const SPECIALTY_LABELS: Record<string, string> = {
  "2": "Món Á",
  "3": "Món Tây",
};

const defaultPagination: Pagination = {
  pageNumber: 1,
  pageSize: PAGE_SIZE,
  totalPages: 1,
  totalRecords: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

// ==================== HELPERS ====================

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

function getMinutesAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return `${mins} phút trước`;
}

// ==================== COMPONENT ====================

export default function HeadChefPage() {
  const { user, logout } = useAuth();
  const [clock, setClock] = useState(() => new Date());

  // Order items list state
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<ConfirmedOrderItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [pageIndex, setPageIndex] = useState(1);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());

  // Assign popup state
  const [popupItemId, setPopupItemId] = useState<string | null>(null);
  const [chefs, setChefs] = useState<AvailableChef[]>([]);
  const [chefsLoading, setChefsLoading] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [assigningChefId, setAssigningChefId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch confirmed order items
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getConfirmedOrderItems(pageIndex, PAGE_SIZE);
      setItems(response.data ?? []);
      setPagination(response.meta?.pagination ?? defaultPagination);
    } catch (error) {
      const fallback = "Không thể tải danh sách món ăn.";
      setErrorMessage(
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message || fallback)
          : fallback,
      );
      setItems([]);
      setPagination(defaultPagination);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Open assign popup and load available chefs
  const openAssignPopup = async (orderItemId: string) => {
    setPopupItemId(orderItemId);
    setSpecialtyFilter("all");
    setChefsLoading(true);
    setChefs([]);
    try {
      const list = await getAvailableChefs();
      setChefs(list);
    } catch {
      setChefs([]);
    } finally {
      setChefsLoading(false);
    }
  };

  const closePopup = () => {
    setPopupItemId(null);
    setChefs([]);
    setAssigningChefId(null);
  };

  // Call assign-chef API, show toast, then refresh
  const handleAssignChef = async (accountId: string) => {
    if (!popupItemId) return;
    setAssigningChefId(accountId);
    try {
      const res = await assignChef({ orderItemId: popupItemId, accountId });
      const successMessage = res.message || "Phân công thành công.";
      setAssignedIds((prev) => new Set(prev).add(popupItemId));
      closePopup();
      // Show toast
      setToast({ message: successMessage });
      setTimeout(() => {
        setToast(null);
        fetchItems();
      }, 3000);
    } catch {
      // keep popup open on error
    } finally {
      setAssigningChefId(null);
    }
  };

  const filteredChefs =
    specialtyFilter === "all"
      ? chefs
      : chefs.filter((c) => c.specialty === specialtyFilter);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <div>
              <p className="text-2xl font-bold leading-none">Head Chef</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.name || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="rounded-full border bg-muted px-3 py-1.5 text-lg font-semibold tabular-nums">
              <Clock3 className="mr-2 inline h-4 w-4" />
              {clock.toLocaleTimeString("vi-VN", { hour12: false })}
            </div>
            <Button variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">
        {/* Title bar */}
        <section className="mb-5 flex flex-col gap-4 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border bg-muted p-2.5">
              <ChefHat className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold">
              Danh sách món ăn cần phân công
            </h2>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-base"
            >
              {pagination.totalRecords} món
            </Badge>
          </div>
        </section>

        {/* Table */}
        {isLoading ? (
          <Card>
            <CardContent className="py-14 text-center text-muted-foreground">
              Đang tải danh sách món ăn...
            </CardContent>
          </Card>
        ) : errorMessage ? (
          <Card>
            <CardContent className="py-14 text-center">
              <p className="font-medium text-destructive">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center text-muted-foreground">
              Không có món ăn nào cần phân công.
            </CardContent>
          </Card>
        ) : (
          <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
            <table className="w-full table-fixed text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="w-[22%] px-5 py-3 text-left font-semibold text-muted-foreground">Tên món</th>
                  <th className="w-[10%] px-4 py-3 text-left font-semibold text-muted-foreground">Giá</th>
                  <th className="w-[14%] px-4 py-3 text-left font-semibold text-muted-foreground">Bàn / Khu vực</th>
                  <th className="w-[11%] px-4 py-3 text-left font-semibold text-muted-foreground">Kênh order</th>
                  <th className="w-[15%] px-4 py-3 text-left font-semibold text-muted-foreground">Ghi chú</th>
                  <th className="w-[14%] px-4 py-3 text-left font-semibold text-muted-foreground">Thời gian</th>
                  <th className="w-[14%] px-4 py-3 text-right font-semibold text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.orderItemId}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold">{item.productName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{formatPrice(item.productPrice)}</td>
                    <td className="px-4 py-4">
                      {item.tableNumber ? (
                        <Badge variant="outline" className="rounded-lg">
                          Bàn {item.tableNumber}
                          {item.areaName ? ` · ${item.areaName}` : ""}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        {item.orderChannel}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground text-xs truncate max-w-0">
                      {item.note || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock3 className="h-3.5 w-3.5 shrink-0" />
                        {getMinutesAgo(item.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        size="sm"
                        variant={assignedIds.has(item.orderItemId) ? "secondary" : "default"}
                        className="flex items-center gap-1.5 ml-auto"
                        onClick={() => openAssignPopup(item.orderItemId)}
                        disabled={assignedIds.has(item.orderItemId)}
                      >
                        <UserCheck className="h-4 w-4" />
                        {assignedIds.has(item.orderItemId) ? "Đã phân công" : "Phân công"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {pagination.pageNumber}/{Math.max(1, pagination.totalPages)} •
            Tổng {pagination.totalRecords} món
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPreviousPage || isLoading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              onClick={() => setPageIndex((prev) => prev + 1)}
              disabled={!pagination.hasNextPage || isLoading}
            >
              Sau
            </Button>
          </div>
        </div>
      </main>

      {/* ==================== ASSIGN POPUP ==================== */}
      {popupItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-xl">
            {/* Popup header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Chọn đầu bếp phân công</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePopup}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Specialty filter tabs */}
            <div className="flex items-center gap-2 rounded-xl border bg-muted p-1 mb-4">
              {[
                { label: "Tất cả", value: "all" },
                { label: "Món Á", value: "2" },
                { label: "Món Tây", value: "3" },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  size="sm"
                  variant={specialtyFilter === tab.value ? "secondary" : "ghost"}
                  onClick={() => setSpecialtyFilter(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Chef list */}
            {chefsLoading ? (
              <p className="py-8 text-center text-muted-foreground">
                Đang tải danh sách đầu bếp...
              </p>
            ) : filteredChefs.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Không có đầu bếp khả dụng.
              </p>
            ) : (
              <div className="max-h-[350px] overflow-y-auto space-y-2">
                {filteredChefs.map((chef) => (
                  <div
                    key={chef.accountId}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{chef.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {SPECIALTY_LABELS[chef.specialty] ?? `Nhóm ${chef.specialty}`}
                        {" · "}Trình độ: {chef.skillLevel}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignChef(chef.accountId)}
                      disabled={assigningChefId !== null}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {assigningChefId === chef.accountId
                        ? "Đang gán..."
                        : "Chọn"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TOAST NOTIFICATION ==================== */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 shadow-lg dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}
