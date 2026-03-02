// ==================== ENUMS ====================

export type Role = 'admin' | 'chef' | 'waiter' | 'cashier';

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';

export type TableStatus = 'available' | 'occupied' | 'waiting-food' | 'waiting-payment';

export type MenuCategory = 'appetizers' | 'main-courses' | 'desserts' | 'beverages' | 'specials' | 'salads';

// ==================== MENU ====================

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: MenuCategory;      
    categoryName: string;     
    image: string;
    isAvailable: boolean;
    preparationTime: number; // in minutes
}

// ==================== ORDER ====================

export interface OrderItem {
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    tableId: string;
    items: OrderItem[];
    status: OrderStatus;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    servedBy?: string; // Employee ID
    notes?: string;
}

// ==================== TABLE ====================

export interface Table {
    id: string;
    number: string;
    capacity: number;
    status: TableStatus;
    currentOrderId?: string;
    positionX: number; // For floor plan positioning (percentage)
    positionY: number;
}

// ==================== EMPLOYEE ====================

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
    phone?: string;
    hireDate: Date;
    isActive: boolean;
}

// ==================== REVENUE ====================

export interface RevenueData {
    date: string;
    revenue: number;
    orders: number;
}

export interface CategoryRevenue {
    category: MenuCategory;
    revenue: number;
    percentage: number;
}

export interface PopularDish {
    menuItem: MenuItem;
    orderCount: number;
    revenue: number;
}

export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    tablesOccupied: number;
    pendingOrders: number;
}

// ==================== CART ====================

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
}

// ==================== AUTH ====================

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
}

// ==================== PRODUCT ====================
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string | null;
    categoryName: string;
    isActive: string | boolean;
}

export interface ProductListParams {
    keyword?: string;
    pageIndex?: number;
    pageSize?: number;
}
