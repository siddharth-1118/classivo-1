"use client";

const ADMIN_AUTH_KEY = "admin_auth";
const ADMIN_EMAIL_KEY = "admin_email";
const ADMIN_PASSWORD_KEY = "admin_password";

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function setAdminSession(email: string, password: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
  sessionStorage.setItem(ADMIN_EMAIL_KEY, email);
  sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

export function getAdminSession() {
  if (typeof window === "undefined") {
    return { email: "", password: "" };
  }
  return {
    email: sessionStorage.getItem(ADMIN_EMAIL_KEY) || "",
    password: sessionStorage.getItem(ADMIN_PASSWORD_KEY) || "",
  };
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  sessionStorage.removeItem(ADMIN_EMAIL_KEY);
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
}
