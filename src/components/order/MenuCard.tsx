"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/mock-data";
import { useOrder } from "@/contexts/OrderContext";

interface MenuCardProps {
    item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
    const { addToCart } = useOrder();

    return (
        <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-sm">
                            Not Available
                        </Badge>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge className="bg-violet-600 hover:bg-violet-700 text-white">
                        {item.preparationTime} min
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                    <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                        {formatCurrency(item.price)}
                    </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                </p>
                <Button
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                    >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    Add to Cart
                </Button>
            </CardContent>
        </Card>
    );
}
