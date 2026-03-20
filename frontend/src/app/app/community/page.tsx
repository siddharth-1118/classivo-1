"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CommunityPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/app/chat");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-premium-gold border-t-transparent" />
    </div>
  );
}
