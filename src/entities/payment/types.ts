export type SubscriptionPlan = {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  currency: string;
  description?: string;
  isActive: boolean;
};

export type Invoice = {
  id: string;
  planId: string;
  status: "pending" | "paid" | "cancelled" | "expired";
  amount: number;
  currency: string;
  createdAt: string;
};

export type PaymentLink = {
  provider: "click" | "payme" | "tribute";
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
};
