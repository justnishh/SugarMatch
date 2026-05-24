"use client";

import { useState, useCallback } from "react";

interface GeolocationResult {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

interface UseGeolocationReturn {
  loading: boolean;
  error: string | null;
  detect: () => Promise<GeolocationResult | null>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (): Promise<GeolocationResult | null> => {
    setDetecting(true);
    setError(null);

    try {
      // Get GPS coordinates
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocode using free Nominatim API
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
        { headers: { "User-Agent": "SugarMatch-App" } }
      );

      if (!res.ok) throw new Error("Could not determine your location");

      const data = await res.json();
      const address = data.address || {};

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.county ||
        "";
      const country = address.country || "";

      setDetecting(false);
      return { latitude, longitude, city, country };
    } catch (err) {
      const message =
        err instanceof GeolocationPositionError
          ? err.code === 1
            ? "Location permission denied"
            : err.code === 2
              ? "Location unavailable"
              : "Location request timed out"
          : err instanceof Error
            ? err.message
            : "Could not detect location";

      setError(message);
      setDetecting(false);
      return null;
    }
  }, []);

  return { loading: detecting, error, detect };
}
