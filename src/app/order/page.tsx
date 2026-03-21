"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { fetchTableBySession } from "@/services/table.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertCircle } from "lucide-react";

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);

  const { placeOrder, setSelectedTable } = useOrder();
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  // Resolve session token from URL → set table
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");
    if (!session) return;
    fetchTableBySession(session)
      .then((res) => {
        setSelectedTable(res.data.tableId);
        setIsSessionLocked(true);
        // Remove session param from URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete("session");
        window.history.replaceState({}, "", url.toString());
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

  const handlePlaceOrder = () => {
    const order = placeOrder();
    if (order) {
      setCurrentOrder(order);
      setShowOrderStatus(true);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/50 dark:bg-orange-950/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <h1 className="text-2xl font-bold">
                  <span className="text-orange-600">
                    Restaurant Menu
                  </span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Select your dishes and place an order
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <VoiceOrderButton
                isListening={isListening}
                isSupported={isSupported}
                onToggle={toggleListening}
              />
              <TableSelector disabled={isSessionLocked} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Section */}
          <div className="flex-1">
            {/* Voice Order Feedback */}
            <div className="mb-6">
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
                <TabsList className="mb-6 h-auto gap-2 bg-transparent p-0 flex overflow-x-auto scrollbar-hide whitespace-nowrap pb-2">
                  {categoryTabs.map((category) => (
                    <TabsTrigger
                      key={category.value}
                      value={category.value}
                      className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-full px-4 shrink-0"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredItems.map((item) => (
                        <MenuCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                      disabled={pageIndex === 1 || isLoading}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={page === pageIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPageIndex(page)}
                          disabled={isLoading}
                          className={`h-9 w-9 p-0 ${
                            page === pageIndex
                              ? "bg-orange-600 text-white border-0 hover:bg-orange-700"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      ),
                    )}

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
          <aside className="lg:w-80 xl:w-96">
            <div className="sticky top-24">
              <Cart onPlaceOrder={handlePlaceOrder} />
            </div>
          </aside>
        </div>
      </div>

      {/* Order Status Dialog */}
      <Dialog open={showOrderStatus} onOpenChange={setShowOrderStatus}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Placed Successfully!</DialogTitle>
            <DialogDescription>
              Your order has been sent to the kitchen. Track its status below.
            </DialogDescription>
          </DialogHeader>
          <OrderStatusDisplay order={currentOrder} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
