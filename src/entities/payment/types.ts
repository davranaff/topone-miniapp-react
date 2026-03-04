export type SubscriptionPlan = {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  currency: string;
  description?: string;
  isActive: boolean;
  isTrial?: boolean;
};

export type SubscriptionPlanRef = {
  id: string;
  name: string;
  price?: number;
  durationMonths?: number;
  isTrial?: boolean;
};

export type UserSubscription = {
  id: string;
  userId: string;
  amount: number;
  durationMonths: number;
  purchaseDate?: string;
  subscriptionEndDate?: string;
  status: string;
  autoRenew?: boolean;
  hasNextSubscription?: boolean;
  paymentMethodTitle?: string;
  currencySymbol?: string;
  plan?: SubscriptionPlanRef;
};

export type PaginatedSubscriptions = {
  items: UserSubscription[];
  page: number;
  pages: number;
  total: number;
};

export type Invoice = {
  id: string;
  planId: string;
  status: "pending" | "paid" | "canceled" | "expired";
  amount: number;
  currency: string;
  createdAt: string;
};

export type PaymentLink = {
  provider: string;
  label: string;
  url: string;
  logoKey: string;
};

export type InvoiceLinks = {
  invoiceId: string;
  links: PaymentLink[];
};

export type InvoiceStatus = {
  invoiceId: string;
  status: Invoice["status"];
  createdAt?: string;
  updatedAt?: string;
  subscriptionId?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  planName?: string;
  planDurationMonths?: number;
};
