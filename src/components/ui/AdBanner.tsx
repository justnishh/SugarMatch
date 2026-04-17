"use client";

import { useEffect } from "react";

export function AdBanner() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pl29173087.profitablecpmratenetwork.com/b8/9b/94/b89b9445a8cc7a16eb524bdc794eb2ba.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}