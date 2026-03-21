"use client";

import Header from "@/app/components/header";
import { LoginComponent } from "../../components/loginComponent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAuthToken } from "@/utils/authStorage";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const t = getAuthToken();
    const isValid = t && t !== "undefined" && t !== "null";
    if (isValid) router.replace("/app/dashboard");
  }, [router]);

  return (
    <div className="relative w-dvw h-dvh flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.1),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.08),transparent_24%),linear-gradient(180deg,#09090b,#111827)]" />

      <Header value="login" />
      <LoginComponent />
    </div>
  );
};

export default Page;
