"use client";

import { useEffect, useState } from "react";

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setDeviceType({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return deviceType;
}