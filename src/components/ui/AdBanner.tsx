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
      const existing = document.head.querySelector(`script[src*="profitablecpmratenetwork"]`);
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  return null;
}

export function StickyAdBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center items-center bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200 h-[50px] shadow-md">
      <div className="max-w-[393px] w-full flex items-center justify-center px-2">
        <div className="text-xs text-rose-800 text-center">
          Advertisement Banner
        </div>
      </div>
    </div>
  );
}

export function StickyBottomAd() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center items-center bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200 h-[60px] shadow-lg">
      <div className="max-w-[393px] w-full flex items-center justify-center px-2">
        <div className="text-xs text-rose-800 text-center">
          Advertisement Banner
        </div>
      </div>
    </div>
  );
}