export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'OWNER' | 'STAFF' | 'ADMIN' | 'CUSTOMER'; // ADMIN = super admin, OWNER = shop owner, STAFF = cashier
  avatarUrl?: string;
  clerkId?: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  welcomeMessage?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency: string;
  timezone: string;
  isActive: boolean;
  isSuspended: boolean;
  ownerId: string;
  acceptCash?: boolean;
  mpesaMethod?: string | null;
  mpesaNumber?: string | null;
  mpesaAccountRef?: string | null;
  mpesaAccountName?: string | null;
  airtelNumber?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  paymentNotes?: string | null;
  branding?: ShopBranding;
  pricing?: ShopPricing;
  allowedFileTypes?: AllowedFileType[];
  enabledServices?: EnabledService[];
  _count?: { orders: number };
}

export interface ShopBranding {
  id: string;
  shopId: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  buttonStyle: string;
  backgroundStyle: string;
}

export interface ShopPricing {
  id: string;
  shopId: string;
  bwPagePrice: number;
  colorPagePrice: number;
  a4Price: number;
  a3Price: number;
  letterPrice: number;
  legalPrice: number;
  spiralBindPrice: number;
  combBindPrice: number;
  tapeBindPrice: number;
  hardcoverPrice: number;
  laminationPrice: number;
  staplingPrice: number;
  foldingPrice: number;
  holePunchPrice: number;
  overheadPercent: number;
  profitMargin: number;
  vatPercent: number;
  platformFeePercent: number;
}

export interface AllowedFileType {
  id: string;
  extension: string;
  mimeType: string;
}

export interface EnabledService {
  id: string;
  service: string;
  enabled: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  subtotal: number;
  printingCost: number;
  bindingCost: number;
  finishingCost: number;
  taxAmount: number;
  serviceFee: number;
  totalAmount: number;
  amountPaid: number;
  isPaid: boolean;
  scheduledPickup?: string;
  estimatedCompletion?: string;
  completedAt?: string;
  collectedAt?: string;
  createdAt: string;
  items: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  uploadId?: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  colorMode: string;
  paperSize: string;
  layout: string;
  printQuality: string;
  copies: number;
  pageRange?: string;
  bindingType: string;
  finishingType: string;
  unitPrice: number;
  lineTotal: number;
  upload?: Upload;
}

export interface Upload {
  id: string;
  originalName: string;
  fileSize: number;
  pageCount: number;
  mimeType: string;
  createdAt: string;
  deleteAfter?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  reference?: string;
  phoneNumber?: string;
  transactionId?: string;
  status: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PRINTING' | 'COMPLETED' | 'CANCELLED' | 'READY_FOR_PICKUP' | 'COLLECTED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED';
export type PaymentMethod = 'MPESA' | 'AIRTEL_MONEY' | 'CARD' | 'CASH_ON_PICKUP';
export type ColorMode = 'BLACK_WHITE' | 'FULL_COLOR';
export type PaperSize = 'A4' | 'A3' | 'LETTER' | 'LEGAL';
export type Layout = 'SINGLE_SIDED' | 'DOUBLE_SIDED';
export type PrintQuality = 'DRAFT' | 'STANDARD' | 'HIGH_QUALITY';
export type BindingType = 'NONE' | 'SPIRAL' | 'COMB' | 'TAPE' | 'HARDCOVER';
export type FinishingType = 'NONE' | 'STAPLING' | 'LAMINATION' | 'FOLDING' | 'HOLE_PUNCH';

export interface PriceBreakdown {
  subtotal: number;
  printingCost: number;
  bindingCost: number;
  finishingCost: number;
  overheadAmount: number;
  profitAmount: number;
  taxAmount: number;
  serviceFee: number;
  totalAmount: number;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  todayPages: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  averageOrderValue: number;
  recentOrders: Order[];
}

export interface Notification {
  id: string;
  userId?: string;
  orderId?: string;
  shopId?: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  read: boolean;
  sentAt?: string;
  createdAt: string;
}
