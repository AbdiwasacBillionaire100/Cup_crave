export type CategoryId = string;
export type OrderType = 'delivery' | 'pickup' | 'table';

export interface SizeOption {
  name: string;
  priceOffset: number;
}

export interface ExtraOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  image: string;
  calories?: number;
  isPopular?: boolean;
  isNew?: boolean;
  available?: boolean;
  rating: number;
  reviewCount: number;
  customizable: boolean;
  sizes?: SizeOption[];
  milkOptions?: string[];
  sweetnessLevels?: string[];
  temperatureOptions?: string[];
  spiceLevels?: string[];
  extras?: ExtraOption[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestocked: string;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  deliveryOrdersCount: number;
  pickupOrdersCount: number;
  tableOrdersCount: number;
  topSellingItems: Array<{
    id: string;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
  }>;
  recentOrders: Order[];
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize: string;
  selectedMilk?: string;
  selectedSweetness?: string;
  selectedTemp?: string;
  selectedSpice?: string;
  selectedExtras: string[];
  itemTotalPrice: number;
  specialInstructions?: string;
}

export type OrderStatus = 'received' | 'crafting' | 'out_for_delivery' | 'ready_for_pickup' | 'delivered';

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  unit?: string;
  deliveryNotes?: string;
  pickupTime?: string;
  tableNumber?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  promoCode?: string;
  total: number;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  estimatedTimeMinutes: number;
  baristaName: string;
  driverName?: string;
  driverPhone?: string;
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  favoriteDrink?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'registered' | 'logged_in' | 'logged_out';
  timestamp: string;
}
