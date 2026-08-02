export type CategoryId = 'all' | 'coffee' | 'coldbrew' | 'tea' | 'bakery' | 'breakfast';

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
  rating: number;
  reviewCount: number;
  customizable: boolean;
  sizes?: SizeOption[];
  milkOptions?: string[];
  sweetnessLevels?: string[];
  temperatureOptions?: string[];
  extras?: ExtraOption[];
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize: string;
  selectedMilk?: string;
  selectedSweetness?: string;
  selectedTemp?: string;
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
}

export interface Order {
  id: string;
  createdAt: string;
  orderType: 'delivery' | 'pickup';
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
