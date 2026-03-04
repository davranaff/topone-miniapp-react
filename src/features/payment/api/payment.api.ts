import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type {
  SubscriptionPlan,
  Invoice,
  InvoiceLinks,
  InvoiceStatus,
  PaymentLink,
  PaginatedSubscriptions,
  UserSubscription,
} from "@/entities/payment/types";

const asRecord = (value: unknown): Record<string, unknown> | null => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
};

const mapPlan = (raw: Record<string, unknown>): SubscriptionPlan => {
  const currency = asRecord(raw.currency);

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? raw.title ?? ""),
    durationMonths: Number(raw.duration_months ?? raw.durationMonths ?? 1),
    price: Number(raw.price ?? raw.amount ?? 0),
    currency: String(currency?.symbol ?? currency?.title ?? raw.currency ?? "UZS"),
    description: raw.description ? String(raw.description) : undefined,
    isActive: Boolean(raw.is_active ?? true),
    isTrial: Boolean(raw.is_trial ?? false),
  };
};

const mapSubscription = (raw: Record<string, unknown>): UserSubscription => {
  const paymentMethod = asRecord(raw.payment_method);
  const currency = asRecord(raw.currency);
  const planRaw = asRecord(raw.plan) ?? asRecord(raw.plan_info);

  return {
    id: String(raw.id ?? ""),
    userId: String(raw.user_id ?? ""),
    amount: Number(raw.amount ?? 0),
    durationMonths: Number(raw.duration_months ?? 0),
    purchaseDate: raw.purchase_date ? String(raw.purchase_date) : undefined,
    subscriptionEndDate: raw.subscription_end_date ? String(raw.subscription_end_date) : undefined,
    status: String(raw.status ?? ""),
    autoRenew: typeof raw.auto_renew === "boolean" ? raw.auto_renew : undefined,
    hasNextSubscription: typeof raw.has_next_subscription === "boolean"
      ? raw.has_next_subscription
      : undefined,
    paymentMethodTitle: paymentMethod?.title ? String(paymentMethod.title) : undefined,
    currencySymbol: currency?.symbol ? String(currency.symbol) : undefined,
    plan: planRaw
      ? {
          id: String(planRaw.id ?? ""),
          name: String(planRaw.name ?? ""),
          price: Number(planRaw.price ?? 0),
          durationMonths: Number(planRaw.duration_months ?? 0),
          isTrial: Boolean(planRaw.is_trial ?? planRaw.isTrial ?? false),
        }
      : undefined,
  };
};

const mapLink = (raw: Record<string, unknown>): PaymentLink => {
  const provider = String(raw.payment_method ?? raw.provider ?? "").toLowerCase();

  return {
    provider,
    label: String(raw.payment_method ?? raw.label ?? raw.provider ?? provider),
    url: String(raw.url ?? raw.payment_url ?? ""),
    logoKey: provider || String(raw.logo_key ?? ""),
  };
};

export const paymentApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await apiClient.get(endpoints.payment.plans);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapPlan);
  },

  async subscribeToFreePlan(planId: string): Promise<UserSubscription> {
    const res = await apiClient.post(endpoints.payment.subscribePlan(planId));
    const data = (res.data?.data ?? res.data) as Record<string, unknown>;
    const subscription = asRecord(data.subscription) ?? data;
    return mapSubscription(subscription);
  },

  async getSubscriptions(params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedSubscriptions> {
    const res = await apiClient.get(endpoints.payment.subscriptions, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        ...(params?.status ? { status: params.status } : {}),
      },
    });

    const payload = res.data ?? {};
    const items = Array.isArray(payload.data) ? payload.data : [];
    const pagination = asRecord(payload.pagination);

    return {
      items: (items as Array<Record<string, unknown>>).map(mapSubscription),
      page: Number(pagination?.page ?? 1),
      pages: Number(pagination?.pages ?? 1),
      total: Number(pagination?.total ?? items.length),
    };
  },

  async getSubscriptionHistory(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedSubscriptions> {
    const res = await apiClient.get(endpoints.payment.subscriptionHistory, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
      },
    });

    const payload = res.data ?? {};
    const items = Array.isArray(payload.data) ? payload.data : [];
    const pagination = asRecord(payload.pagination);

    return {
      items: (items as Array<Record<string, unknown>>).map(mapSubscription),
      page: Number(pagination?.page ?? 1),
      pages: Number(pagination?.pages ?? 1),
      total: Number(pagination?.total ?? items.length),
    };
  },

  async payFromReferralEarnings(planId: string): Promise<UserSubscription | null> {
    const res = await apiClient.post(endpoints.payment.payFromReferralEarnings, {
      plan_id: planId,
    });
    const payload = asRecord(res.data?.data ?? res.data);
    const subscriptionRaw = asRecord(payload?.subscription) ?? payload;

    if (!subscriptionRaw || !subscriptionRaw.id) {
      return null;
    }

    return mapSubscription(subscriptionRaw);
  },

  async extendFromReferralEarnings(): Promise<UserSubscription | null> {
    const res = await apiClient.post(endpoints.payment.extendFromReferralEarnings);
    const payload = asRecord(res.data?.data ?? res.data);
    const subscriptionRaw = asRecord(payload?.subscription) ?? payload;

    if (!subscriptionRaw || !subscriptionRaw.id) {
      return null;
    }

    return mapSubscription(subscriptionRaw);
  },

  async createInvoiceWithLinks(planId: string, returnUrl?: string): Promise<InvoiceLinks> {
    const res = await apiClient.post(endpoints.payment.createInvoice, undefined, {
      params: {
        plan_id: planId,
        ...(returnUrl ? { return_url: returnUrl } : {}),
      },
    });
    const data = (res.data?.data ?? res.data) as Record<string, unknown>;
    const invoice = asRecord(data.invoice);
    const paymentLinks = Array.isArray(data.payment_links) ? data.payment_links : [];

    return {
      invoiceId: String(invoice?.id ?? ""),
      links: paymentLinks
        .map((link) => mapLink(link as Record<string, unknown>))
        .filter((link) => Boolean(link.url)),
    };
  },

  async getInvoiceLinks(invoiceId: string, returnUrl?: string): Promise<InvoiceLinks> {
    const res = await apiClient.get(endpoints.payment.invoiceLinks(invoiceId), {
      params: returnUrl ? { return_url: returnUrl } : undefined,
    });
    const data = (res.data?.data ?? res.data) as Record<string, unknown>;
    const invoice = asRecord(data.invoice);
    const paymentLinks = Array.isArray(data.payment_links) ? data.payment_links : [];

    return {
      invoiceId: String(invoice?.id ?? invoiceId),
      links: paymentLinks
        .map((link) => mapLink(link as Record<string, unknown>))
        .filter((link) => Boolean(link.url)),
    };
  },

  async getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus> {
    const res = await apiClient.get(endpoints.payment.invoiceStatus(invoiceId));
    const data = res.data?.data ?? res.data;
    return {
      invoiceId: String(data.invoice_id ?? invoiceId),
      status: (data.status ?? "pending") as InvoiceStatus["status"],
      createdAt: data.created_at ? String(data.created_at) : undefined,
      updatedAt: data.updated_at ? String(data.updated_at) : undefined,
      subscriptionId: data.subscription_id ? String(data.subscription_id) : undefined,
      subscriptionStart: data.subscription_start ? String(data.subscription_start) : undefined,
      subscriptionEnd: data.subscription_end ? String(data.subscription_end) : undefined,
      planName: data.plan_name ? String(data.plan_name) : undefined,
      planDurationMonths: Number(data.plan_duration_months ?? 0) || undefined,
    };
  },

  async createInvoice(planId: string): Promise<Invoice> {
    const res = await apiClient.post(
      `${endpoints.payment.createInvoice}?plan_id=${encodeURIComponent(planId)}`,
    );
    const data = (res.data?.data ?? res.data) as Record<string, unknown>;
    const invoice = asRecord(data.invoice);

    return {
      id: String(invoice?.id ?? ""),
      planId,
      status: (invoice?.status ?? "pending") as Invoice["status"],
      amount: Number(invoice?.amount ?? invoice?.plan_price ?? 0),
      currency: String(invoice?.currency_symbol ?? invoice?.currency_code ?? "UZS"),
      createdAt: String(invoice?.created_at ?? ""),
    };
  },
};
