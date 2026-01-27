import {
    MenuItem,
    Table,
    Employee,
    Order,
    RevenueData,
    PopularDish,
    DashboardStats,
} from '@/types';

// ==================== MENU ITEMS ====================

export const menuItems: MenuItem[] = [
    // Appetizers
    {
        id: 'app-1',
        name: 'Crispy Spring Rolls',
        description: 'Golden fried spring rolls stuffed with vegetables and served with sweet chili sauce',
        price: 8.99,
        category: 'appetizers',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        isAvailable: true,
        preparationTime: 10,
    },
    {
        id: 'app-2',
        name: 'Garlic Butter Shrimp',
        description: 'Succulent shrimp sautéed in garlic butter with herbs',
        price: 12.99,
        category: 'appetizers',
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5671f?w=400',
        isAvailable: true,
        preparationTime: 12,
    },
    {
        id: 'app-3',
        name: 'Bruschetta Trio',
        description: 'Three artisan toasts with tomato basil, mushroom, and olive tapenade',
        price: 9.99,
        category: 'appetizers',
        image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
        isAvailable: true,
        preparationTime: 8,
    },

    // Main Courses
    {
        id: 'main-1',
        name: 'Grilled Ribeye Steak',
        description: 'Prime 12oz ribeye with herb butter, roasted potatoes, and seasonal vegetables',
        price: 34.99,
        category: 'main-courses',
        image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
        isAvailable: true,
        preparationTime: 25,
    },
    {
        id: 'main-2',
        name: 'Pan-Seared Salmon',
        description: 'Atlantic salmon with lemon dill sauce, asparagus, and wild rice',
        price: 28.99,
        category: 'main-courses',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        isAvailable: true,
        preparationTime: 20,
    },
    {
        id: 'main-3',
        name: 'Chicken Parmesan',
        description: 'Breaded chicken breast with marinara, mozzarella, and spaghetti',
        price: 22.99,
        category: 'main-courses',
        image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400',
        isAvailable: true,
        preparationTime: 22,
    },
    {
        id: 'main-4',
        name: 'Mushroom Risotto',
        description: 'Creamy arborio rice with wild mushrooms, truffle oil, and parmesan',
        price: 19.99,
        category: 'main-courses',
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400',
        isAvailable: true,
        preparationTime: 25,
    },

    // Desserts
    {
        id: 'des-1',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
        price: 9.99,
        category: 'desserts',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        isAvailable: true,
        preparationTime: 5,
    },
    {
        id: 'des-2',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, vanilla ice cream',
        price: 11.99,
        category: 'desserts',
        image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
        isAvailable: true,
        preparationTime: 12,
    },
    {
        id: 'des-3',
        name: 'New York Cheesecake',
        description: 'Creamy cheesecake with graham crust and berry compote',
        price: 8.99,
        category: 'desserts',
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
        isAvailable: true,
        preparationTime: 5,
    },

    // Beverages
    {
        id: 'bev-1',
        name: 'Fresh Lemonade',
        description: 'House-made lemonade with fresh mint',
        price: 4.99,
        category: 'beverages',
        image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400',
        isAvailable: true,
        preparationTime: 3,
    },
    {
        id: 'bev-2',
        name: 'Iced Coffee',
        description: 'Cold brew coffee with cream',
        price: 5.99,
        category: 'beverages',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        isAvailable: true,
        preparationTime: 3,
    },
    {
        id: 'bev-3',
        name: 'Tropical Smoothie',
        description: 'Mango, pineapple, and coconut blend',
        price: 6.99,
        category: 'beverages',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
        isAvailable: true,
        preparationTime: 5,
    },

    // Specials
    {
        id: 'spec-1',
        name: "Chef's Special Lobster",
        description: 'Whole Maine lobster with drawn butter, corn on the cob, and coleslaw',
        price: 49.99,
        category: 'specials',
        image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
        isAvailable: true,
        preparationTime: 30,
    },
    {
        id: 'spec-2',
        name: 'Wagyu Beef Sliders',
        description: 'Three wagyu beef sliders with caramelized onions and truffle aioli',
        price: 24.99,
        category: 'specials',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        preparationTime: 18,
    },
];

// ==================== TABLES ====================

export const tables: Table[] = [
    { id: 'table-1', number: 1, capacity: 2, status: 'available', positionX: 10, positionY: 10 },
    { id: 'table-2', number: 2, capacity: 2, status: 'occupied', currentOrderId: 'order-1', positionX: 30, positionY: 10 },
    { id: 'table-3', number: 3, capacity: 4, status: 'waiting-food', currentOrderId: 'order-2', positionX: 50, positionY: 10 },
    { id: 'table-4', number: 4, capacity: 4, status: 'available', positionX: 70, positionY: 10 },
    { id: 'table-5', number: 5, capacity: 6, status: 'waiting-payment', currentOrderId: 'order-3', positionX: 10, positionY: 40 },
    { id: 'table-6', number: 6, capacity: 6, status: 'available', positionX: 30, positionY: 40 },
    { id: 'table-7', number: 7, capacity: 8, status: 'occupied', currentOrderId: 'order-4', positionX: 50, positionY: 40 },
    { id: 'table-8', number: 8, capacity: 4, status: 'available', positionX: 70, positionY: 40 },
    { id: 'table-9', number: 9, capacity: 2, status: 'available', positionX: 10, positionY: 70 },
    { id: 'table-10', number: 10, capacity: 4, status: 'waiting-food', currentOrderId: 'order-5', positionX: 30, positionY: 70 },
    { id: 'table-11', number: 11, capacity: 6, status: 'available', positionX: 50, positionY: 70 },
    { id: 'table-12', number: 12, capacity: 8, status: 'available', positionX: 70, positionY: 70 },
];

// ==================== EMPLOYEES ====================

export const employees: Employee[] = [
    {
        id: 'emp-1',
        name: 'John Anderson',
        email: 'john.anderson@restaurant.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        phone: '+1 (555) 123-4567',
        hireDate: new Date('2022-01-15'),
        isActive: true,
    },
    {
        id: 'emp-2',
        name: 'Maria Garcia',
        email: 'maria.garcia@restaurant.com',
        role: 'chef',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        phone: '+1 (555) 234-5678',
        hireDate: new Date('2022-03-20'),
        isActive: true,
    },
    {
        id: 'emp-3',
        name: 'David Chen',
        email: 'david.chen@restaurant.com',
        role: 'chef',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        phone: '+1 (555) 345-6789',
        hireDate: new Date('2022-06-10'),
        isActive: true,
    },
    {
        id: 'emp-4',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@restaurant.com',
        role: 'waiter',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        phone: '+1 (555) 456-7890',
        hireDate: new Date('2023-02-01'),
        isActive: true,
    },
    {
        id: 'emp-5',
        name: 'Michael Brown',
        email: 'michael.brown@restaurant.com',
        role: 'waiter',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        phone: '+1 (555) 567-8901',
        hireDate: new Date('2023-05-15'),
        isActive: true,
    },
    {
        id: 'emp-6',
        name: 'Emily Davis',
        email: 'emily.davis@restaurant.com',
        role: 'cashier',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        phone: '+1 (555) 678-9012',
        hireDate: new Date('2023-08-20'),
        isActive: true,
    },
];

// ==================== ORDERS ====================

export const orders: Order[] = [
    {
        id: 'order-1',
        tableId: 'table-2',
        items: [
            { menuItem: menuItems[0], quantity: 2 },
            { menuItem: menuItems[3], quantity: 1 },
        ],
        status: 'cooking',
        totalAmount: 52.97,
        createdAt: new Date(Date.now() - 15 * 60000),
        updatedAt: new Date(Date.now() - 10 * 60000),
        servedBy: 'emp-4',
    },
    {
        id: 'order-2',
        tableId: 'table-3',
        items: [
            { menuItem: menuItems[4], quantity: 2 },
            { menuItem: menuItems[7], quantity: 1 },
        ],
        status: 'cooking',
        totalAmount: 69.97,
        createdAt: new Date(Date.now() - 20 * 60000),
        updatedAt: new Date(Date.now() - 5 * 60000),
        servedBy: 'emp-5',
    },
    {
        id: 'order-3',
        tableId: 'table-5',
        items: [
            { menuItem: menuItems[13], quantity: 1 },
            { menuItem: menuItems[8], quantity: 2 },
        ],
        status: 'served',
        totalAmount: 71.97,
        createdAt: new Date(Date.now() - 60 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
        servedBy: 'emp-4',
    },
    {
        id: 'order-4',
        tableId: 'table-7',
        items: [
            { menuItem: menuItems[5], quantity: 3 },
            { menuItem: menuItems[10], quantity: 3 },
            { menuItem: menuItems[11], quantity: 3 },
        ],
        status: 'pending',
        totalAmount: 116.91,
        createdAt: new Date(Date.now() - 5 * 60000),
        updatedAt: new Date(Date.now() - 5 * 60000),
        servedBy: 'emp-5',
    },
    {
        id: 'order-5',
        tableId: 'table-10',
        items: [
            { menuItem: menuItems[1], quantity: 1 },
            { menuItem: menuItems[6], quantity: 2 },
            { menuItem: menuItems[9], quantity: 2 },
        ],
        status: 'ready',
        totalAmount: 82.95,
        createdAt: new Date(Date.now() - 35 * 60000),
        updatedAt: new Date(Date.now() - 2 * 60000),
        servedBy: 'emp-4',
    },
];

// ==================== REVENUE DATA ====================

const generateRevenueData = (days: number): RevenueData[] => {
    const data: RevenueData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 3000) + 1500,
            orders: Math.floor(Math.random() * 50) + 20,
        });
    }

    return data;
};

export const dailyRevenue = generateRevenueData(7);
export const weeklyRevenue = generateRevenueData(28);
export const monthlyRevenue = generateRevenueData(90);

// ==================== DASHBOARD STATS ====================

export const dashboardStats: DashboardStats = {
    totalOrders: 156,
    totalRevenue: 12458.90,
    averageOrderValue: 79.86,
    tablesOccupied: 5,
    pendingOrders: 3,
};

export const popularDishes: PopularDish[] = [
    { menuItem: menuItems[3], orderCount: 45, revenue: 1574.55 }, // Ribeye
    { menuItem: menuItems[4], orderCount: 38, revenue: 1101.62 }, // Salmon
    { menuItem: menuItems[5], orderCount: 32, revenue: 735.68 },  // Chicken Parm
    { menuItem: menuItems[0], orderCount: 28, revenue: 251.72 },  // Spring Rolls
    { menuItem: menuItems[8], orderCount: 25, revenue: 299.75 },  // Lava Cake
];

// ==================== HELPER FUNCTIONS ====================

export const getMenuByCategory = (category: string) => {
    if (category === 'all') return menuItems;
    return menuItems.filter((item) => item.category === category);
};

export const getTableById = (id: string) => {
    return tables.find((table) => table.id === id);
};

export const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id);
};

export const getEmployeeById = (id: string) => {
    return employees.find((emp) => emp.id === id);
};

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

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
