"use client";

import { useDeviceType } from "@/lib/hooks/useDeviceType";

interface MobileViewProps {
  children: React.ReactNode;
}

export function MobileView({ children }: MobileViewProps) {
  const { isMobile, isDesktop } = useDeviceType();

  if (isMobile) {
    return <>{children}</>;
  }

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="w-full max-w-[393px] h-[100dvh] max-h-[850px] bg-background rounded-[40px] overflow-hidden shadow-2xl border-8 border-zinc-900 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-50" />
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}