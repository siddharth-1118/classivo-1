"use client";

import Header from "@/app/components/header";
import { LoginComponent } from "../../components/loginComponent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { getAuthToken } from "@/utils/authStorage";

const Aurora = dynamic(() => import("@/app/components/Aurora"), { ssr: false });

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const t = getAuthToken();
    const isValid = t && t !== "undefined" && t !== "null";
    if (isValid) router.replace("/app/dashboard");
  }, [router]);

  return (
    <div className="relative w-dvw h-dvh flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Aurora
          colorStops={["#d4af37", "#38bdf8", "#f97316"]}
          amplitude={0.85}
          blend={0.65}
          speed={0.7}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_32%),linear-gradient(180deg,rgba(9,9,11,0.35),rgba(9,9,11,0.8))]" />

      <Header value="login" />
      <LoginComponent />
    </div>
  );
};

export default Page;
