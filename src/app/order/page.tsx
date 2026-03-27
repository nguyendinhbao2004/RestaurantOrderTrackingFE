"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { MenuCard } from "@/components/order/MenuCard";
import { Cart } from "@/components/order/Cart";
import { TableSelector } from "@/components/order/TableSelector";
import { OrderStatusDisplay } from "@/components/order/OrderStatus";
import { VoiceOrderButton } from "@/components/order/VoiceOrderButton";
import { VoiceOrderFeedback } from "@/components/order/VoiceOrderFeedback";
import { Order, MenuItem, Category } from "@/types";
import { useOrder } from "@/contexts/OrderContext";
import { useVoiceOrder } from "@/hooks/useVoiceOrder";
import { fetchProducts } from "@/services/product.service";
import { fetchCategories } from "@/services/category.service";
import { mapProductsToMenuItems } from "@/lib/helpers";
import { createOrderItems } from "@/services/order.service";
import { fetchTableBySession, fetchTableDetail } from "@/services/table.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [lockedTableLabel, setLockedTableLabel] = useState<string | null>(null);

  const { placeOrder, setSelectedTable, getCartItemCount, cart, clearCart } = useOrder();
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Resolve session token from URL → set table
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");
    if (!session) return;
    fetchTableBySession(session)
      .then(async (res) => {
        const tableId = res.data.tableId;
        setSelectedTable(tableId);
        setLockedTableLabel(`Table ${res.data.tableNumber} (${res.data.areaName})`);
        setIsSessionLocked(true);
        // Remove session param from URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete("session");
        window.history.replaceState({}, "", url.toString());

        try {
          const detailRes = await fetchTableDetail(tableId);
          const orders = detailRes.data.Orders;
          if (Array.isArray(orders) && orders.length > 0) {
            setCurrentOrderId(orders[0].id);
          } else if (orders && !Array.isArray(orders) && (orders as any).id) {
            setCurrentOrderId((orders as any).id);
          }
        } catch (detailErr) {
          console.error("Lỗi khi tải chi tiết bàn:", detailErr);
        }
      })
      .catch((err) => console.error("Không lấy được bàn từ session:", err));
  }, []);

  // Pagination States
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  // API States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isListening,
    isSupported,
    isProcessing,
    transcript,
    interimTranscript,
    matchedItems,
    error: voiceError,
    toggleListening,
    stopListening,
    clearResults,
  } = useVoiceOrder({ menuItems });

  // Fetch products from API
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchProducts({
        pageIndex,
        pageSize: PAGE_SIZE,
      });

      const items = mapProductsToMenuItems(response.data);
      setMenuItems(items);

      const pagination = response.meta?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Không thể tải danh sách món ăn. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex]);

  // Fetch categories from API
  const loadCategories = useCallback(async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await fetchCategories();
      // Only keep active categories
      const activeCategories = response.data.filter((cat) => cat.isActive);
      setCategories(activeCategories);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categoryTabs = useMemo(() => {
    return [
      { value: "all", label: "Tất cả" },
      ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
    ];
  }, [categories]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return menuItems;
    }
    return menuItems.filter((item) => item.categoryName === selectedCategory);
  }, [menuItems, selectedCategory]);

  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, pageIndex - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);

    return Array.from(
      { length: end - normalizedStart + 1 },
      (_, i) => normalizedStart + i,
    );
  }, [pageIndex, totalPages]);

  const handlePlaceOrder = async () => {
    if (!currentOrderId) {
      alert("Bàn này chưa có cấu trúc đơn hàng. Vui lòng liên hệ nhân viên!");
      return;
    }

    if (cart.length === 0) return;

    try {
      const payload = {
        orderId: currentOrderId,
        orderChannel: "QR",
        createdBy: null,
        items: cart.map(item => ({
          productId: item.menuItem.id,
          note: item.notes.filter(Boolean).join(", ") || "",
          quantity: item.quantity
        }))
      };

      await createOrderItems(payload);
      
      clearCart();
      setShowCartPopup(false);
      alert("Gửi yêu cầu đặt món thành công!");
    } catch (err) {
      console.error("Lỗi đặt món:", err);
      alert("Có lỗi xảy ra khi đặt món. Vui lòng thử lại.");
    }
  };

  const cartItemCount = getCartItemCount();

  return (
    <div className="min-h-screen overflow-x-hidden bg-orange-50/50 dark:bg-orange-950/20">
      {/* Mobile Fixed Cart Button */}
      <div className="fixed top-3 right-3 z-50 lg:hidden">
        <Button
          onClick={() => setShowCartPopup(true)}
          className="relative h-10 gap-2 bg-orange-600 px-3 text-white shadow-lg hover:bg-orange-700"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-xs font-semibold">Giỏ hàng</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {cartItemCount}
            </span>
          )}
        </Button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                </Link>
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold leading-tight">
                  <span className="text-orange-600">
                    Restaurant Menu
                  </span>
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Select your dishes and place an order
                </p>
              </div>
            </div>
            <div className="flex w-full md:w-auto flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="w-full sm:w-auto">
                <VoiceOrderButton
                  isListening={isListening}
                  isSupported={isSupported}
                  onToggle={toggleListening}
                />
              </div>
              <TableSelector
                disabled={isSessionLocked}
                lockedTableLabel={lockedTableLabel}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Menu Section */}
          <div className="flex-1 min-w-0">
            {/* Voice Order Feedback */}
            <div className="mb-4 sm:mb-6">
              <VoiceOrderFeedback
                isListening={isListening}
                isProcessing={isProcessing}
                transcript={transcript}
                interimTranscript={interimTranscript}
                matchedItems={matchedItems}
                error={voiceError}
                onStop={stopListening}
                onClear={clearResults}
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-orange-600 mb-4" />
                <p className="text-muted-foreground">Đang tải menu...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive mb-1">
                        Lỗi tải dữ liệu
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {error}
                      </p>
                      <Button
                        onClick={() => window.location.reload()}
                        size="sm"
                        variant="outline"
                      >
                        Thử lại
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            {!isLoading && !error && (
              <Tabs
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v)}
              >
                <TabsList className="mb-4 sm:mb-6 h-auto w-full gap-2 bg-transparent p-0 flex overflow-x-auto scrollbar-hide whitespace-nowrap pb-2 -mx-1 px-1">
                  {categoryTabs.map((category) => (
                    <TabsTrigger
                      key={category.value}
                      value={category.value}
                      disabled={isCategoriesLoading}
                      className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-full px-3 sm:px-4 text-xs sm:text-sm shrink-0"
                    >
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-0">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Không có món ăn nào trong danh mục này.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      {filteredItems.map((item) => (
                        <MenuCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 sm:mt-8 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                      disabled={pageIndex === 1 || isLoading}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {paginationPages.map((page) => (
                      <Button
                        key={page}
                        variant={page === pageIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPageIndex(page)}
                        disabled={isLoading}
                        className={`h-9 w-9 shrink-0 p-0 ${
                          page === pageIndex
                            ? "bg-orange-600 text-white border-0 hover:bg-orange-700"
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageIndex((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={pageIndex === totalPages || isLoading}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </Tabs>
            )}
          </div>

          {/* Cart Sidebar */}
          <aside className="hidden w-full lg:block lg:w-80 xl:w-96">
            <div className="lg:sticky lg:top-24">
              <Cart onPlaceOrder={handlePlaceOrder} />
            </div>
          </aside>
        </div>
      </div>

      {/* Order Status Dialog */}
      <Dialog open={showOrderStatus} onOpenChange={setShowOrderStatus}>
        <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Placed Successfully!</DialogTitle>
            <DialogDescription>
              Your order has been sent to the kitchen. Track its status below.
            </DialogDescription>
          </DialogHeader>
          <OrderStatusDisplay order={currentOrder} />
        </DialogContent>
      </Dialog>

      {/* Mobile Cart Popup */}
      <Dialog open={showCartPopup} onOpenChange={setShowCartPopup}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-sm p-0">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle>Giỏ hàng của bạn</DialogTitle>
            <DialogDescription>
              Xem, chỉnh số lượng món và đặt đơn ngay tại đây.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-3">
            <Cart onPlaceOrder={handlePlaceOrder} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
