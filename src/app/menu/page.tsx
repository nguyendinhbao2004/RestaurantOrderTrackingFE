"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  ShoppingBag,
  LogIn,
  LogOut,
  ArrowRight,
  Clock,
  Star,
  Lock,
} from "lucide-react";
import { MenuItem } from "@/types";
import { useOrder } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProducts } from "@/services/product.service";
import { fetchCategories } from "@/services/category.service";
import { mapProductsToMenuItems } from "@/lib/helpers";
import { Category } from "@/types";
import { formatCurrency } from "@/lib/helpers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MenuPage() {
  /* ─── Product state ─── */
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 12;

  /* ─── Cart UI ─── */
  const [showCart, setShowCart] = useState(false);

  const router = useRouter();

  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
  } = useOrder();

  const { isAuthenticated, logout, user } = useAuth();

  /* ─── Fetch products ─── */
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchProducts({ pageIndex, pageSize: PAGE_SIZE });
      setMenuItems(mapProductsToMenuItems(response.data));
      const pagination = response.meta?.pagination;
      if (pagination) setTotalPages(pagination.totalPages);
    } catch {
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* ─── Fetch categories ─── */
  useEffect(() => {
    fetchCategories()
      .then((res) => setApiCategories(res.data))
      .catch(() => {});
  }, []);

  /* ─── Categories ─── */
  const categories = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      ...apiCategories
        .filter((c) => c.isActive)
        .map((c) => ({ value: c.name, label: c.name })),
    ],
    [apiCategories],
  );

  /* ─── Filtered items ─── */
  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (selectedCategory !== "all") {
      items = items.filter((i) => i.categoryName === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  /* ─── Checkout handler ─── */
  const handleCheckoutClick = () => {
    setShowCart(false);
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push("/customer");
  };

  return (
    <div className="min-h-screen bg-orange-50/50 dark:bg-orange-950/20">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/60 backdrop-blur-xl shadow-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white font-bold text-base">R</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-orange-600 hidden sm:inline">
                Restaurant
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-border/50 bg-muted/50 focus:bg-background"
              />
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="relative rounded-full px-4"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Giỏ hàng</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>

              {!isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 text-sm hidden sm:flex"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Đăng nhập
                </Button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1">
                    <Avatar className="h-8 w-8 border-2 border-orange-200 dark:border-orange-800">
                      <AvatarFallback className="bg-orange-500 text-white text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold leading-none">
                      {user?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={logout}
                    title="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-orange-600">
              Thực đơn
            </span>
          </h1>
          <p className="text-muted-foreground">
            Duyệt thực đơn và chọn món yêu thích.{" "}
            {!isAuthenticated && (
              <span className="text-amber-600 font-medium">
                Đăng nhập để tiến hành đặt hàng.
              </span>
            )}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mb-4" />
            <p className="text-muted-foreground">Đang tải thực đơn...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">
                    Lỗi tải dữ liệu
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
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

        {/* Products */}
        {!isLoading && !error && (
          <>
            {/* Category Tabs */}
            <Tabs
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v)}
            >
              <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent p-0">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-full px-5 py-2"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-lg">
                      Không tìm thấy món ăn
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Thử danh mục hoặc từ khóa khác
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onAdd={() => addToCart(item)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  disabled={pageIndex === 1}
                  className="h-9 w-9 p-0 rounded-full"
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
                      className={`h-9 w-9 p-0 rounded-full ${
                        page === pageIndex
                          ? "bg-orange-600 text-white border-0"
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
                  disabled={pageIndex === totalPages}
                  className="h-9 w-9 p-0 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Floating Cart Button ─── */}
      {getCartItemCount() > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden bg-orange-600 text-white rounded-full px-6 py-3.5 shadow-2xl shadow-orange-500/40 flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{getCartItemCount()} món</span>
          <Separator orientation="vertical" className="h-5 bg-white/30" />
          <span className="font-bold">{formatCurrency(getCartTotal())}</span>
        </button>
      )}

      {/* ─── Cart Drawer ─── */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-md p-0 gap-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              Giỏ hàng
              {getCartItemCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                >
                  {getCartItemCount()} món
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Xem lại các món trước khi thanh toán
            </DialogDescription>
          </DialogHeader>

          <Separator />

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">
                Giỏ hàng trống
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Thêm món ăn ngon nào!
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => setShowCart(false)}
              >
                Xem thực đơn
              </Button>
            </div>
          ) : (
            <div className="flex flex-col min-h-0 flex-1">
              <ScrollArea className="flex-1 px-6 overflow-y-auto">
                <div className="py-4 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-sm text-orange-600 font-semibold">
                          {formatCurrency(item.menuItem.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() =>
                            updateCartQuantity(
                              item.menuItem.id,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() =>
                            updateCartQuantity(
                              item.menuItem.id,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive rounded-full"
                          onClick={() => removeFromCart(item.menuItem.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(getCartTotal())}
                  </span>
                </div>

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    Đăng nhập để tiến hành thanh toán.
                  </p>
                )}

                <Button
                  onClick={handleCheckoutClick}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full py-5 text-base"
                >
                  {isAuthenticated ? (
                    <>
                      Tiến hành thanh toán
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Đăng nhập để đặt hàng
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

/* ──────────── Product Card ──────────── */

function ProductCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
            <X className="w-8 h-8 text-white" />
            <Badge
              variant="destructive"
              className="text-sm font-semibold px-3 py-1 bg-red-600 hover:bg-red-600"
            >
              Hết hàng
            </Badge>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 dark:bg-stone-950/70 text-foreground backdrop-blur-sm text-xs">
            {item.categoryName}
          </Badge>
        </div>

        {/* Prep time */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {item.preparationTime} phút
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="font-semibold text-base leading-tight flex-1 pr-2 group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(item.price)}
          </span>

          <Button
            onClick={onAdd}
            disabled={!item.isAvailable}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 disabled:bg-stone-400"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm
          </Button>
        </div>

        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, j) => (
            <Star key={j} className="w-3 h-3 text-amber-500 fill-amber-500" />
          ))}
          <span className="text-xs text-muted-foreground ml-1">5.0</span>
        </div>
      </CardContent>
    </Card>
  );
}
