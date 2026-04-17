"use client";

import { useEffect } from "react";

const POPUNDER_SCRIPT = "https://pl29173087.profitablecpmratenetwork.com/b8/9b/94/b89b9445a8cc7a16eb524bdc794eb2ba.js";

export function AdBanner() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = POPUNDER_SCRIPT;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}