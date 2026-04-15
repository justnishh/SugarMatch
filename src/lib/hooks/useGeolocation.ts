"use client";

import { useState, useCallback } from "react";

interface LocationData {
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const detect = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Geolocation not supported" }));
      return null;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    return new Promise<LocationData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );

            if (!response.ok) {
              throw new Error("Failed to reverse geocode");
            }

            const data = await response.json();
            const address = data.address;

            const city =
              address.city ||
              address.town ||
              address.village ||
              address.county ||
              address.municipality;

            const locationData: LocationData = {
              city,
              country: address.country,
              latitude,
              longitude,
            };

            setState({
              location: locationData,
              loading: false,
              error: null,
            });

            resolve(locationData);
          } catch {
            const locationData: LocationData = {
              latitude,
              longitude,
            };

            setState({
              location: locationData,
              loading: false,
              error: "Could not determine location name",
            });

            resolve(locationData);
          }
        },
        (error) => {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          resolve(null);
        }
      );
    });
  }, []);

  return { ...state, detect };
}