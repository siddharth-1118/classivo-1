"use client";
import { useAuth } from "@/hooks/zustand";
import { serverLogin } from "@/server/action";
import type { Json } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";
import React, { useState, useMemo } from "react";
import Cookies from "js-cookie";
import { Loader } from "../app/components/loader";
import { DEV_TOKEN_PREFIX } from "@/utils/devMode";
import { emitAuthEvent } from "@/utils/authSync";
import { encrypt } from "@/utils/encryption";
import { updateUserCache } from "@/lib/userCache";
import { token } from "@/utils/Tokenize";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";
import { setAuthToken } from "@/utils/authStorage";


type LoginPayload = {
  account: string;
  password: string;
  cdigest?: string;
  captcha?: string;
};

type LooseRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === "object" && value !== null;

const hasMessage = (value: unknown): value is { message?: unknown } =>
  isRecord(value) && "message" in value;

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const extractStatusCode = (value: unknown): number | null => {
  if (!value || typeof value !== "object") return null;
  const maybeStatus = (value as { status?: unknown }).status;
  if (typeof maybeStatus === "number" && Number.isFinite(maybeStatus)) {
    return maybeStatus;
  }
  if (typeof maybeStatus === "string") {
    const parsed = Number(maybeStatus);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const containsRateLimitMessage = (message?: string) =>
  typeof message === "string" && /rate limit|too many requests?/i.test(message);

const isBackendUnavailable = (message?: string) =>
  typeof message === "string" &&
  /temporarily unavailable|service unavailable|your space is in error/i.test(message);

const isRateLimitError = (error: unknown, fallbackMessage?: string): boolean => {
  const status = extractStatusCode(error);
  if (status === 429) {
    return true;
  }
  if (containsRateLimitMessage(fallbackMessage)) {
    return true;
  }
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && containsRateLimitMessage(data)) {
      return true;
    }
    if (isRecord(data) && typeof data.error === "string" && containsRateLimitMessage(data.error)) {
      return true;
    }
  }
  return false;
};

export const LoginComponent = () => {
  const [eyeOpen, setEyeOpen] = useState(false);
  const { error, setError, loading, setLoading, setEmail, email } = useAuth();
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [captchaDigest, setCaptchaDigest] = useState<string | null>(null);
  const [captchaCode, setCaptchaCode] = useState("");

  const toMessage = (val: unknown) => {
    if (typeof val === "string") {
      if (val.includes("Unexpected token '<'") || val.toLowerCase().includes("<html") || val.includes("JSON")) {
        return "Login service is temporarily unavailable. Please try again in a few moments.";
      }
      return val;
    }
    if (hasMessage(val)) {
      const messageValue = val.message;
      return typeof messageValue === "string" ? messageValue : String(messageValue);
    }
    try {
      return String(val);
    } catch {
      return "Unexpected error";
    }
  };

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const hash1 = form.get("name") as string;
      const hash2 = form.get("password") as string;

      if (hash1 && hash1.length !== 0) {
        const addr = hash1.includes("@");
        const email = (addr ? hash1 : `${hash1}@srmist.edu.in`).toLowerCase();

        const devEmail = (process.env.NEXT_PUBLIC_DEV_EMAIL || "dev@srmist.edu.in").toLowerCase();
        if (email === devEmail) {
          setEmail({
            mail: email,
            digest: "dev",
            identifier: "dev",
          });
          setLoading(false);
          return;
        }
        setEmail({
          mail: email,
          digest: "step2",
          identifier: "step2",
        });
        setCaptchaImage(null);
        setCaptchaDigest(null);
        setCaptchaCode("");
        setLoading(false);
        return;
      }

      // Second step: Validate password
      if (hash2 && hash2.length !== 0) {
        if (!email.digest || !email.identifier) {
          setError("Please enter your email first");
          setLoading(false);
          return;
        }

        const devEmail = (process.env.NEXT_PUBLIC_DEV_EMAIL || "dev@srmist.edu.in").toLowerCase();
        const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD || "Classivo123";
        if (email.mail.toLowerCase() === devEmail) {
          if (hash2 === devPassword) {
            const devToken = `${DEV_TOKEN_PREFIX}${Math.random().toString(36).slice(2)}`;
            setAuthToken(devToken);
            Cookies.set("user", email.mail, { expires: 30, path: "/" });
            emitAuthEvent("login");
            return (window.location.href = "/app/dashboard");
          } else {
            setError("Invalid dev credentials");
            setLoading(false);
            return;
          }
        }
        const payload: LoginPayload = { account: email.mail, password: hash2 };
        if (captchaDigest && captchaCode) {
          payload.cdigest = captchaDigest;
          payload.captcha = captchaCode;
        }
        const { res } = await serverLogin(payload);
        const response = (res ?? {}) as Json;
        const responseRecord = response as LooseRecord;
        const dataRecord = isRecord(responseRecord["data"]) ? (responseRecord["data"] as LooseRecord) : null;

        console.log("Full Backend Response:", responseRecord);

        if (responseRecord["captcha"] || responseRecord["image"] || dataRecord?.["captcha"]) {
          const captchaRecord =
            (isRecord(responseRecord["captcha"]) && (responseRecord["captcha"] as LooseRecord)) ||
            (dataRecord && isRecord(dataRecord["captcha"]) ? (dataRecord["captcha"] as LooseRecord) : null);
          const imgCandidate =
            captchaRecord?.["image"] ??
            captchaRecord?.["Image"] ??
            responseRecord["image"] ??
            null;
          const digestCandidate =
            captchaRecord?.["cdigest"] ??
            captchaRecord?.["Cdigest"] ??
            responseRecord["cdigest"] ??
            null;

          if (typeof imgCandidate === "string" && imgCandidate.length > 0) {
            const imageSrc = imgCandidate.startsWith("data:image")
              ? imgCandidate
              : `data:image/png;base64,${imgCandidate}`;
            setCaptchaImage(imageSrc);
            setCaptchaDigest(typeof digestCandidate === "string" ? digestCandidate : null);
            setCaptchaCode("");
            setError("Please enter the code shown below.");
            setLoading(false);
            return;
          }
        }

        const cookiesValue = responseRecord["cookies"];
        const authenticated =
          responseRecord["authenticated"] === true || responseRecord["status"] === "success";
        const sessionRecord = isRecord(responseRecord["session"]) ? (responseRecord["session"] as LooseRecord) : null;
        const sessionSuccess = sessionRecord?.["success"] !== false;
        const cookiesText = typeof cookiesValue === "string" ? cookiesValue.trim() : "";
        const hasCookies = cookiesText.length > 0 && !cookiesText.toLowerCase().includes("undefined");
        const loginSucceeded = (authenticated === true || sessionSuccess) && hasCookies;

        if (authenticated && (cookiesText.includes("iamtt"))) {
          setError("Maximum concurrent sessions limit reached");
          setLoading(false);
          return;
        }

        if (loginSucceeded) {
          if (hasCookies) {
            setAuthToken(cookiesText);
            Cookies.set("user", email.mail, { expires: 30, path: "/" });
            const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "@Ethical_Hacker2";
            encrypt(hash2, encryptionKey).then((encryptedPassword) => {
              updateUserCache(email.mail, encryptedPassword);
            }).catch((err) => {
              console.error("Encryption failed:", err);
            });
          }
          setCaptchaImage(null);
          setCaptchaDigest(null);
          setCaptchaCode("");
          emitAuthEvent("login");
          return (window.location.href = "/app/dashboard");
        }

        const errorsValue = responseRecord["errors"];
        const primaryError = Array.isArray(errorsValue) ? errorsValue[0] : undefined;
        const msg =
          toOptionalString(responseRecord["message"]) ||
          toOptionalString(responseRecord["error"]) ||
          toOptionalString(primaryError) ||
          toOptionalString(sessionRecord?.["message"]) ||
          "Login failed";
        const normalizedMsg = msg.toLowerCase();
        const statusCodeRaw = responseRecord["status"];
        const statusCode =
          typeof statusCodeRaw === "number"
            ? statusCodeRaw
            : typeof statusCodeRaw === "string"
              ? Number(statusCodeRaw)
              : null;
        const sessionFailure =
          !!sessionRecord && typeof sessionRecord["success"] === "boolean" && sessionRecord["success"] === false;

        if (normalizedMsg.includes("old password")) {
          setError(msg);
          setLoading(false);
          return;
        }

        const invalidPassword =
          statusCode === 403 ||
          normalizedMsg.includes("invalid password") ||
          normalizedMsg.includes("password is incorrect") ||
          normalizedMsg.includes("password you entered") ||
          sessionFailure;

        if (invalidPassword) {
          setError("Invalid password. Please double-check your SRM password and try again.");
          setLoading(false);
          return;
        }

        setError(toMessage(msg));
        setLoading(false);
        return;
      }

      // If neither hash1 nor hash2 is provided
      setError("Please enter your credentials");
      setLoading(false);
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error ?? "Unknown error");
      if (isRateLimitError(error, errorMessage)) {
        setError("You have made too many login attempts in a short time. Please wait about a minute before trying again.");
        setLoading(false);
        return;
      }
      if (isBackendUnavailable(errorMessage)) {
        setError("Login service is temporarily unavailable. Please try again in a few moments.");
        setLoading(false);
        return;
      }

      // Handle JSON parsing errors
      if (errorMessage.includes("Unexpected token '<'") ||
        errorMessage.includes("<html") ||
        errorMessage.includes("JSON") ||
        errorMessage.includes("not valid JSON")) {
        setError("Login service is temporarily unavailable. Please try again in a few moments.");
      } else {
        setError(toMessage(errorMessage));
      }
      setLoading(false);
    }
  };
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 lg:px-0">
      <div className="mx-auto relative w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative grid grid-cols-1 lg:min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between border-b border-white/10 px-6 py-6 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-premium-gold/20 bg-premium-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-premium-gold">
                <ClassivoLogo className="h-4 w-4" />
                Premium Student Access
              </div>
              <h1 className="mt-6 max-w-xl text-3xl font-bold leading-tight text-white sm:text-5xl">
                Secure access to your academic dashboard.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
                Login to Classivo to view your timetable, attendance, marks, and academic calendar in a student-friendly way.
                Everything is arranged to be simple, readable, and quick to understand.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Inside Classivo</div>
                <div className="mt-3 grid gap-3 text-sm text-zinc-200">
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">Timetable with clear class boxes and day-order support</div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">Attendance summaries with safety status and graphs</div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">Marks and calendar shown in a way students can understand fast</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-premium-gold/10 p-5 text-sm leading-7 text-zinc-100">
                Begin with your SRM email address and continue with your password. If Academia requires CAPTCHA verification,
                Classivo will display it here and guide you through the next step.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-6 lg:px-10 lg:py-10">
            <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-black/25 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {email?.digest.length === 0 ? "Step 1" : "Step 2"}
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  {email?.digest.length === 0 ? "Enter your SRM email" : "Enter your password"}
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  {email?.digest.length === 0
                    ? "Your SRM email address will be used to proceed to the secure authentication step."
                    : `Signing in as ${email.mail}`}
                </p>
              </div>

              <form onSubmit={HandleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  {email?.digest.length === 0 && (
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        SRM Mail ID
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="name"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-premium-gold/40 focus:bg-white/10"
                        placeholder="example@srmist.edu.in"
                        autoComplete="email"
                        autoFocus
                        required
                      />
                    </div>
                  )}

                  {email?.digest.length !== 0 && (
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Password
                      </label>
                      <div className="relative z-10">
                        <input
                          id="password"
                          name="password"
                          type={eyeOpen ? "text" : "password"}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 pr-14 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-premium-gold/40 focus:bg-white/10"
                          placeholder="Enter your SRM password"
                          autoComplete="current-password"
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setEyeOpen((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                        >
                          {eyeOpen ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {email?.digest.length !== 0 && captchaImage && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Verification</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={captchaImage} alt="captcha" className="mt-3 w-full max-w-60 rounded-xl border border-white/10 bg-black/20" />
                      <input
                        id="captcha"
                        name="captcha"
                        type="text"
                        value={captchaCode}
                        onChange={(e) => setCaptchaCode(e.target.value)}
                        className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-premium-gold/40"
                        placeholder="Enter CAPTCHA"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {String(error).includes("CAPTCHA") ? (
                      "Captcha not supported yet"
                    ) : String(error).toLowerCase().includes("old password") || String(error).includes("Error") ? (
                      <div className="flex flex-col items-start gap-2 text-left">
                        <span>You&apos;ve entered an old password. Please enter your new password.</span>
                        <a
                          href="https://academia.srmist.edu.in"
                          target="_blank"
                          rel="noopener"
                          className="text-sm text-white/70 underline transition-colors hover:text-white"
                        >
                          Open Academia to set new password
                        </a>
                      </div>
                    ) : String(error).includes("concurrent") || (typeof token() === "string" && token().includes("iamtt")) ? (
                      <div className="flex flex-col items-start gap-2 text-left">
                        <span>Maximum concurrent sessions limit reached.</span>
                        <a
                          href="https://academia.srmist.edu.in/49910842/portal/academia-academic-services/myProfile"
                          target="_blank"
                          rel="noopener"
                          className="text-sm text-white/70 underline transition-colors hover:text-white"
                        >
                          Login to Academia and terminate all sessions
                        </a>
                      </div>
                    ) : (
                      String(error)
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl bg-premium-gold px-4 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-black transition-all hover:bg-[#f3cf63] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader className="h-4 w-4 text-black" />
                      Processing
                    </span>
                  ) : email?.digest.length === 0 ? (
                    "Continue"
                  ) : (
                    "Login"
                  )}
                </button>

                <a
                  href="https://academia.srmist.edu.in/reset"
                  target="_blank"
                  rel="noopener"
                  className="text-center text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Forgot Password?
                </a>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
