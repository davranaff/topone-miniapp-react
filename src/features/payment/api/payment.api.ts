import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type {
  SubscriptionPlan,
  Invoice,
  InvoiceLinks,
  InvoiceStatus,
  PaymentLink,
} from "@/entities/payment/types";

const mapPlan = (r: Record<string, unknown>): SubscriptionPlan => ({
  id: String(r.id ?? ""),
  name: String(r.name ?? r.title ?? ""),
  durationMonths: Number(r.duration_months ?? r.durationMonths ?? 1),
  price: Number(r.price ?? r.amount ?? 0),
  currency: String(r.currency ?? "UZS"),
  description: r.description ? String(r.description) : undefined,
  isActive: Boolean(r.is_active ?? true),
});

const mapLink = (r: Record<string, unknown>): PaymentLink => ({
  provider: (r.provider ?? "click") as PaymentLink["provider"],
  label: String(r.label ?? r.provider ?? ""),
  url: String(r.url ?? r.payment_url ?? ""),
  logoKey: String(r.logo_key ?? r.provider ?? ""),
});

export const paymentApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await apiClient.get(endpoints.payment.plans);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapPlan);
  },

  async createInvoice(planId: string): Promise<Invoice> {
    const res = await apiClient.post(
      `${endpoints.payment.createInvoice}?plan_id=${planId}`,
    );
    const d = res.data?.data ?? res.data;
    return {
      id: String(d.id ?? ""),
      planId,
      status: (d.status ?? "pending") as Invoice["status"],
      amount: Number(d.amount ?? 0),
      currency: String(d.currency ?? "UZS"),
      createdAt: String(d.created_at ?? d.createdAt ?? ""),
    };
  },

  async getInvoiceLinks(invoiceId: string): Promise<InvoiceLinks> {
    const res = await apiClient.get(endpoints.payment.invoiceLinks(invoiceId));
    const payload = res.data?.data ?? res.data;
    const raw = Array.isArray(payload) ? payload : (payload?.links ?? []);
    return {
      invoiceId,
      links: (raw as Array<Record<string, unknown>>).map(mapLink),
    };
  },

  async getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus> {
    const res = await apiClient.get(endpoints.payment.invoiceStatus(invoiceId));
    const d = res.data?.data ?? res.data;
    return {
      invoiceId,
      status: (d.status ?? "pending") as InvoiceStatus["status"],
    };
  },
};
