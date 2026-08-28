// Categories are dynamic (managed from the admin panel); these are the seeded defaults.
export type CategoryType = string;

export interface Category {
  id: string;          // slug, e.g. 'jewellery' or 'rings'
  name: string;
  parentId?: string | null;
  sort?: number;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: CategoryType;
  subcategory?: string | null;
  priceINR: number;
  /** Optional — the shop prices in INR; kept for legacy rows. */
  priceUSD?: number;
  image: string;
  secondaryImages?: string[];
  description: string;
  featured?: boolean;
  isNewArrival?: boolean;
  inStock: boolean;
  specifications: {
    material?: string; // e.g. 18K Yellow Gold, Platinum 950
    karat?: string; // e.g. 24K Gold, 18K Rose Gold
    gemstones?: string; // e.g. VVS1 Diamonds, Ceylon Sapphire
    fragranceNotes?: {
      top: string;
      heart: string;
      base: string;
    };
    volume?: string; // e.g. 100ml / 3.4 fl. oz
    concentration?: string; // e.g. Pure Extrait de Parfum (30%)
    caseSize?: string; // e.g. 41mm Swiss Automatic
  };
  artisanStory?: string;
  sku: string;
  /** Selectable size options shown as buttons on the storefront. */
  sizes?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  /** Set by the database on insert; read-only. */
  createdAt?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedMetal?: string;
  customEngraving?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  addresses?: ShippingAddress[];
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotalINR: number;
  taxINR: number;
  discountINR: number;
  totalINR: number;
  totalUSD: number;
  paymentMethod: 'Razorpay' | 'Card' | 'UPI' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Placed' | 'In Artisan Crafting' | 'Quality Assured' | 'Shipped via Express' | 'Delivered' | 'Cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  giftWrapped?: boolean;
  notes?: string;
}

export type ThemeMode = 'emerald' | 'obsidian' | 'pearl';

export type PageView = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'orders' 
  | 'admin' 
  | 'brand-story' 
  | 'craftsmanship';

export interface DatabaseSchemaTable {
  tableName: string;
  columns: {
    columnName: string;
    dataType: string;
    isNullable: boolean;
    isPrimaryKey: boolean;
    description: string;
  }[];
  rowCount: number;
}

/** A registered account as the admin panel sees it, with their order history rolled up. */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  avatar?: string | null;
  createdAt: string | null;
  /** 'Email' for a password account, 'Google' for one created by Google sign-in. */
  signUpMethod: 'Email' | 'Google';
  orderCount: number;
  totalSpentINR: number;
  lastOrderAt: string | null;
}
