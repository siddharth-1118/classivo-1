"use client";

import Header from "@/app/components/header";
import { LoginComponent } from "../../components/loginComponent";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";

// WebGL should only run on the client
const Aurora = dynamic(() => import("@/app/components/Aurora"), { ssr: false });

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const t = Cookies.get("token");
    const isValid = t && t !== "undefined" && t !== "null";
    if (isValid) router.replace("/app/dashboard");
  }, [router]);

  return (
    <div className="relative w-dvw h-dvh flex flex-col overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Aurora
          colorStops={["#FFFFFF", "#C7C7C7", "#C7C7C7"]}
          amplitude={0.5}
          blend={0.5}
          speed={0.8}
        />
      </div>

      {/* Foreground UI */}
      <Header value="login" />
      <LoginComponent />
    </div>
  );
};

export default Page;
