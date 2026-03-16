"use client";
import React, { useState, useEffect } from "react";
import { TallyModal } from "@/components/TallyModal";

export function TallyModalRoot() {
  const [showTally, setShowTally] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("tallySeen");
      if (!seen || seen === "0") setShowTally(true);
    }
  }, []);

  const handleClose = () => {
    setShowTally(false);
    const script = document.getElementById("tally-embed-script");
    if (script) {
      script.remove();
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tallySeen", "1");
    }
  };

  return (
    <TallyModal
      open={showTally}
      onClose={handleClose}
      formUrl="https://tally.so/r/nWLEvv"
    />
  );
}
