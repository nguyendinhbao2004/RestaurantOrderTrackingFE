"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/helpers";
import { useOrder } from "@/contexts/OrderContext";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const { addToCart } = useOrder();

  return (
    <Card className="group w-full max-w-none overflow-hidden border-border/50 bg-card/50 p-0 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
            <div className="bg-red-600 rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </div>
            <Badge
              variant="destructive"
              className="text-sm font-semibold px-3 py-1 bg-red-600 hover:bg-red-600"
            >
              Hết hàng
            </Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-orange-600 px-2 py-0.5 text-[10px] hover:bg-orange-700 text-white">
            {item.preparationTime} min
          </Badge>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-tight sm:text-base">
            {item.name}
          </h3>
          <span className="shrink-0 text-sm font-bold text-orange-600 dark:text-orange-400 sm:text-base">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="mb-2 line-clamp-1 text-xs text-muted-foreground sm:mb-3 sm:text-sm">
          {item.description}
        </p>
        <Button
          onClick={() => addToCart(item)}
          disabled={!item.isAvailable}
          className="mt-auto h-8 w-full bg-orange-600 px-2 text-xs text-white hover:bg-orange-700 disabled:bg-stone-400 sm:h-9 sm:text-sm"
        >
          {item.isAvailable ? (
            <>
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
                className="mr-1.5"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              Thêm vào giỏ
            </>
          ) : (
            "Hết hàng"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
