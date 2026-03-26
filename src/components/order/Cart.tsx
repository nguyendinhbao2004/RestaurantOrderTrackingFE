"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/contexts/OrderContext";
import { formatCurrency } from "@/lib/helpers";
import { Loader2 } from "lucide-react";

interface CartProps {
  onPlaceOrder: () => void;
  isPlacingOrder?: boolean;
  placeOrderError?: string | null;
}

export function Cart({ onPlaceOrder, isPlacingOrder = false, placeOrderError }: CartProps) {
  const {
    cart,
    selectedTable,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
  } = useOrder();

  if (cart.length === 0) {
    return (
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2">
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
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            Giỏ hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center px-4 pb-6 sm:px-6">
          <div className="text-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-50"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <p>Your cart is empty</p>
            <p className="text-sm">Add items from the menu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
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
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            Your Cart
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {getCartItemCount()} items
          </span>
        </CardTitle>
      </CardHeader>
      <Separator />
      <ScrollArea className="max-h-[45vh] sm:max-h-[52vh] lg:max-h-[58vh] flex-1 px-4 sm:px-6">
        <div className="py-4 space-y-4">
          {cart.map((item) => (
            <div key={item.menuItem.id} className="flex gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.menuItem.price)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    updateCartQuantity(item.menuItem.id, item.quantity - 1)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </Button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    updateCartQuantity(item.menuItem.id, item.quantity + 1)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.menuItem.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <CardContent className="pt-4 px-4 pb-4 sm:px-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Tổng tiền</span>
          <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(getCartTotal())}
          </span>
        </div>
        {selectedTable ? (
          <>
            <Button
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi món...
                </>
              ) : (
                "Đặt món"
              )}
            </Button>
            {placeOrderError && (
              <p className="text-sm text-center text-destructive">{placeOrderError}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-center text-amber-600 dark:text-amber-400">
            Vui lòng chọn bàn trước
          </p>
        )}
      </CardContent>
    </Card>
  );
}
