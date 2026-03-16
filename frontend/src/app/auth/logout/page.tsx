
"use client";

import { Loader } from "@/app/app/components/loader";
import { getLogout } from "@/server/action";
import { getCookie } from "@/utils/getCookieClient";
import { emitAuthEvent } from "@/utils/authSync";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const clearSession = async () => {
      const token = getCookie();
      if (token) {
        try {
          await getLogout(token);
        } catch (error) {
          console.error("Logout API failed:", error);
        }
      }

      // Try multiple ways to clear the token to be safe
      Cookies.remove("token", { path: "/" });
      Cookies.remove("token");
      Cookies.remove("user", { path: "/" });
      Cookies.remove("user");

      // Clear localStorage and sessionStorage just in case
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}

      emitAuthEvent("logout");

      console.log("[Logout] Session cleared, redirecting in 500ms...");

      // Small delay to allow cookie changes to propagate
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 500);
    };
    clearSession();
  }, []);

  return (
    <div className="w-dvw h-dvh items-center justify-center flex flex-col  gap-4 ">
      <Loader className="w-8 h-8 " />
      <h1 className="text-xl text-white/50 animate-pulse">Logging Out</h1>
    </div>
  );
};

export default Page;
