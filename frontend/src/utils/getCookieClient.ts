"use client";
import Cookies from "js-cookie";
import { PaymentType } from "../../Types/payment";
export function getCookie() {
  const cookie = Cookies.get("token");
  return cookie as string;
}

export function getEmail() {
  const user = Cookies.get("user");
  return user as string;
}

export function getPaymentClient() {
  const paymentCookie = Cookies.get("Payment-data");
  const cookie = paymentCookie ? JSON.parse(paymentCookie) : null;
  return cookie as PaymentType | null;
}
