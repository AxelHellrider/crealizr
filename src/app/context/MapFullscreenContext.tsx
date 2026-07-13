"use client";

import { createContext, useContext, useState } from "react";

type MapFullscreenContextType = {
  isFullscreen: boolean;
  setIsFullscreen: (open: boolean) => void;
};

const MapFullscreenContext = createContext<MapFullscreenContextType | undefined>(undefined);

/** Tracks whether the Encounter Builder's battlefield map is in fullscreen mode, so unrelated fixed/sticky chrome (e.g. the PWA install badge) can hide itself while it's open. */
export function MapFullscreenProvider({ children }: { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <MapFullscreenContext.Provider value={{ isFullscreen, setIsFullscreen }}>
      {children}
    </MapFullscreenContext.Provider>
  );
}

export function useMapFullscreen() {
  const context = useContext(MapFullscreenContext);
  if (context === undefined) {
    throw new Error("useMapFullscreen must be used within a MapFullscreenProvider");
  }
  return context;
}
