export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
  unit: string;
  categoryId?: string;
  supplierId?: string;
  category?: { id: string; name: string; color?: string };
  supplier?: { id: string; name: string; leadTimeDays?: number };
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_STOCK' | 'OUT_OF_STOCK';
  inventoryValue: number;
  potentialProfit: number;
  marginPercent: number;
  createdAt: string;
  updatedAt: string;
  lastRestockedAt?: string;
}

export interface Sale {
  id: string;
  referenceNumber: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  costOfGoods: number;
  grossProfit: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY' | 'CREDIT' | 'OTHER';
  paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  customerName?: string;
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  soldAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  profit: number;
}

export interface Purchase {
  id: string;
  referenceNumber: string;
  supplierName?: string;
  total: number;
  amountPaid: number;
  paymentStatus: string;
  status: string;
  purchasedAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface DashboardStats {
  salesToday: number;
  profitToday: number;
  transactionsToday: number;
  salesThisWeek: number;
  profitThisWeek: number;
  salesThisMonth: number;
  profitThisMonth: number;
  totalInventoryValue: number;
  totalInventorySellingValue: number;
  potentialInventoryProfit: number;
  totalProducts: number;
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  actual?: number;
  confidenceLow?: number;
  confidenceHigh?: number;
  isForecasted: boolean;
}

export interface ForecastResult {
  productId: string;
  productName: string;
  method: string;
  dataPointsUsed: number;
  forecastPoints: ForecastPoint[];
  dailyAverage: number;
  predictedTotal: number;
  mape?: number;
  mae?: number;
  insufficientData: boolean;
  message?: string;
}

export interface RestockRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  avgDailySales: number;
  daysUntilStockout: number | null;
  recommendedQuantity: number;
  urgency: 'IMMEDIATE' | 'SOON' | 'SUFFICIENT';
  reason: string;
  estimatedCost: number;
  supplierName?: string;
  supplierLeadDays?: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}
