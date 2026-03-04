import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { sessionStorage as authSessionStorage } from "@/shared/auth/session-storage";

const PAYMENT_LINK_PREFIX = "topone:payment-link:";

export const buildPaymentSuccessReturnUrl = (invoiceId: string) => {
  if (!invoiceId) {
    return "https://example.com/payment-success";
  }

  if (typeof window === "undefined") {
    return `https://example.com/payment-success?invoiceId=${encodeURIComponent(invoiceId)}`;
  }

  const url = new URL("/payment-success", window.location.origin);
  url.searchParams.set("invoiceId", invoiceId);
  return url.toString();
};

export const storePaymentLink = (invoiceId: string, paymentUrl: string) => {
  if (typeof window === "undefined" || !invoiceId || !paymentUrl) {
    return;
  }

  window.sessionStorage.setItem(`${PAYMENT_LINK_PREFIX}${invoiceId}`, paymentUrl);
};

export const readPaymentLink = (invoiceId: string) => {
  if (typeof window === "undefined" || !invoiceId) {
    return null;
  }

  return window.sessionStorage.getItem(`${PAYMENT_LINK_PREFIX}${invoiceId}`);
};

export const clearPaymentLink = (invoiceId: string) => {
  if (typeof window === "undefined" || !invoiceId) {
    return;
  }

  window.sessionStorage.removeItem(`${PAYMENT_LINK_PREFIX}${invoiceId}`);
};

export const refreshPaymentSession = async () => {
  const tokens = useAuthStore.getState().tokens;

  if (!tokens) {
    return null;
  }

  const user = await authApi.getCurrentUser();
  authSessionStorage.setUser(user);
  useAuthStore.getState().setSession({ user, tokens });
  return user;
};
