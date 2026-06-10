export type DashboardResponse = {
  month: string;
  monthlySpent: number;
  purchasesInMonth: number;
  pantryItemsCount: number;
  expiringSoonCount: number;
  expiredItemsCount: number;
};

export type PantryItemResponse = {
  id: number;
  productId: number;
  productName: string;
  categoryName: string | null;
  quantity: number;
  expirationDate: string | null;
  daysToExpire: number | null;
  status: string;
};

export type SmartListItemResponse = {
  productId: number;
  productName: string;
  categoryName: string | null;
  currentQuantity: number;
  suggestedQuantity: number;
  lastUnitPrice: number | null;
  reason: string;
};

export type MarketComparisonItemResponse = {
  productId: number;
  productName: string;
  suggestedQuantity: number;
  unitPrice: number | null;
  estimatedTotal: number;
  priceAvailable: boolean;
};

export type MarketComparisonResponse = {
  marketId: number;
  marketName: string;
  estimatedTotal: number;
  availableItems: number;
  missingItems: number;
  items: MarketComparisonItemResponse[];
};

export type PurchaseItemResponse = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type PurchaseResponse = {
  id: number;
  marketId: number;
  marketName: string;
  purchaseDate: string;
  totalAmount: number;
  items: PurchaseItemResponse[];
};