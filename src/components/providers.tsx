"use client";

import { useEffect } from "react";
import { useDevice } from "@/state/device";

export function Providers({ children }: { children: React.ReactNode }) {
  const lang = useDevice((s) => s.lang);

  useEffect(() => {
    void useDevice.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}
