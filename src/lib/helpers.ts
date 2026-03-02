/**
 * Utility functions for formatting and common operations
 */

import { Product, MenuItem, MenuCategory } from '@/types';

/**
 * Extract unique categories from products array
 */
export const extractUniqueCategories = (products: Product[]): string[] => {
    const categories = new Set<string>();
    products.forEach(product => {
        if (product.categoryName) {
            categories.add(product.categoryName);
        }
    });
    return Array.from(categories).sort();
};

/**
 * Map Product from API to MenuItem for UI
 */
export const mapProductToMenuItem = (product: Product): MenuItem => {
    // Normalize category to match MenuCategory type
    const categoryMap: Record<string, MenuCategory> = {
        'appetizers': 'appetizers',
        'main-courses': 'main-courses',
        'main courses': 'main-courses',
        'desserts': 'desserts',
        'beverages': 'beverages',
        'specials': 'specials',
        'salads': 'salads',
    };

    const normalizedCategory = product.categoryName.toLowerCase();
    const category = categoryMap[normalizedCategory] || 'specials' as MenuCategory;

    return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        category,
        categoryName: product.categoryName, 
        image: product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        isAvailable: product.isActive === 'True' || product.isActive === true,
        preparationTime: 15, // Default value, adjust if API provides this
    };
};

/**
 * Map array of Products to MenuItems
 */
export const mapProductsToMenuItems = (products: Product[]): MenuItem[] => {
    return products.map(mapProductToMenuItem);
};

/**
 * Get color class for table status
 */
export const getTableStatusColor = (status: string): string => {
    switch (status) {
        case 'available':
            return 'bg-emerald-500';
        case 'occupied':
            return 'bg-blue-500';
        case 'waiting-food':
            return 'bg-amber-500';
        case 'waiting-payment':
            return 'bg-rose-500';
        default:
            return 'bg-gray-500';
    }
};

/**
 * Get color class for order status
 */
export const getOrderStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-amber-500';
        case 'cooking':
            return 'bg-blue-500';
        case 'ready':
            return 'bg-emerald-500';
        case 'served':
            return 'bg-purple-500';
        case 'cancelled':
            return 'bg-rose-500';
        default:
            return 'bg-gray-500';
    }
};

/**
 * Format number as currency
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('vi-VN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
