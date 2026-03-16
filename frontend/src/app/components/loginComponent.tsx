"use client";
import { useAuth } from "@/hooks/zustand";
import { serverLogin } from "@/server/action";
import type { Json } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Loader } from "../app/components/loader";
import { DEV_TOKEN_PREFIX } from "@/utils/devMode";
import { emitAuthEvent } from "@/utils/authSync";
import { encrypt } from "@/utils/encryption";
import { updateUserCache } from "@/lib/userCache";
import { token } from "@/utils/Tokenize";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";


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
            Cookies.set("token", devToken, { expires: 30, path: "/" });
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
            Cookies.set("token", cookiesText, { expires: 30, path: "/" });
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
    <div className="flex-1 flex items-center justify-center px-6 lg:px-0">
      <div className="relative max-w-5xl min-h-[300px] lg:min-h-[50%] w-full rounded-3xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 apply-border-md backdrop-blur-3xl apply-inner-shadow-sm">
        <div className="absolute inset-0 bg-white/10 blur-3xl -z-10" />

        <div className="flex items-center justify-center min-h-20 lg:text-4xl h-full text-2xl font-bold tracking-tighter text-premium-gold uppercase italic">
          Classivo
        </div>
        <div className="w-full h-full flex items-center justify-center ">
          <form
            onSubmit={HandleSubmit}
            className="w-[90%] h-[90%] flex flex-col justify-center items-center gap-10 p-4"
          >
            <div className="w-full flex flex-col gap-4 ">
              {/* Show email input if digest is empty (first step) */}
              {email?.digest.length === 0 && (
                <input
                  id="name"
                  name="name"
                  type="name"
                  className="w-full px-4 py-3 rounded-xl apply-inner-shadow-sm bg-white/10 focus:outline-none border border-white/5 focus:border-premium-gold/30 transition-colors"
                  placeholder="SRM Mail ID"
                  autoComplete="email"
                  autoFocus
                  required
                />
              )}
              {/* Show password input if digest is present and password is not yet set (second step) */}
              {email?.digest.length !== 0 && (
                <div className="w-full relative z-10 ">
                  <input
                    id="password"
                    name="password"
                    type={eyeOpen ? "name" : "password"}
                    className="w-full px-4 py-3 rounded-xl apply-inner-shadow-sm bg-white/10 focus:outline-none border border-white/5 focus:border-premium-gold/30 transition-colors"
                    placeholder="Password"
                    autoComplete="current-password"
                    autoFocus
                    required
                  />
                  <div className="right-0 top-1/2 -translate-y-1/2 absolute flex items-center justify-end pr-5 ">
                    {eyeOpen ? (
                      <Eye
                        onClick={() => setEyeOpen((prev) => !prev)}
                        className="h-6 w-6 cursor-pointer"
                      />
                    ) : (
                      <EyeOff
                        onClick={() => setEyeOpen((prev) => !prev)}
                        className="h-6 w-6 cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              )}
              {email?.digest.length !== 0 && captchaImage && (
                <div className="w-full flex flex-col gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={captchaImage} alt="captcha" className="w-full max-w-60 h-auto rounded-xl apply-inner-shadow-sm bg-white/10" />
                  <input
                    id="captcha"
                    name="captcha"
                    type="text"
                    value={captchaCode}
                    onChange={(e) => setCaptchaCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl apply-inner-shadow-sm bg-white/10 focus:outline-none border border-white/5 focus:border-premium-gold/30 transition-colors"
                    placeholder="Enter CAPTCHA"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
            {error &&
              <div className="text-red-400 font-medium text-sm text-center">
                {String(error).includes("CAPTCHA") ? (
                  "Captcha not supported yet"
                ) : String(error).toLowerCase().includes("old password") || String(error).includes("Error") ? (
                  <div className="flex items-center justify-center gap-2 flex-col text-center">
                    You&apos;ve entered an old password. Please enter your new password.
                    <a
                      href="https://academia.srmist.edu.in"
                      target="_blank"
                      rel="noopener"
                      className="text-white/50 text-sm underline hover:text-white transition-colors"
                    >
                      (Open Academia to set new password)
                    </a>
                  </div>
                ) : (String(error).includes("concurrent")) || (typeof token() === "string" && token().includes("iamtt")) ? (
                  <div className="flex items-center justify-center gap-2 flex-col text-center text-red-400">
                    Maximum concurrent sessions limit reached
                    <a
                      href="https://academia.srmist.edu.in/49910842/portal/academia-academic-services/myProfile"
                      target="_blank"
                      rel="noopener"
                      className="text-white/50 text-sm underline hover:text-white transition-colors"
                    >
                      (Login to Academia and Terminate all Sessions)
                    </a>
                  </div>
                ) : (
                  String(error)
                )}
              </div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl apply-inner-shadow-md bg-premium-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] focus:outline-none flex item-center justify-center cursor-pointer"
            >
              {loading ? <Loader className="w-6 h-6 " /> : <h1>Login</h1>}
            </button>
          </form>
        </div>
        <a
          href="https://academia.srmist.edu.in/reset"
          target="_blank"
          rel="noopener"
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 apply-border-sm bg-white/5 rounded-full text-xs font-medium text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
        >
          Forgot Password?
        </a>
      </div>
    </div>
  );
};
