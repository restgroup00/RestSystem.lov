import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  accent_color: string | null;
  logo_url: string | null;
};

type TenantCtx = {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  setCurrentTenantId: (id: string | null) => void;
  centralMode: boolean;
  setCentralMode: (v: boolean) => void;
  isLoading: boolean;
  refetch: () => void;
};

const Ctx = createContext<TenantCtx | null>(null);
const STORAGE_KEY = "nexus.currentTenantId";
const CENTRAL_KEY = "nexus.centralMode";

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null,
  );
  const [centralMode, setCentralModeState] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem(CENTRAL_KEY) === "1" : false,
  );

  const { data: tenants = [], isLoading, refetch } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, slug, accent_color, logo_url")
        .order("created_at");
      if (error) throw error;
      return data as Tenant[];
    },
  });

  useEffect(() => {
    if (!currentId && tenants.length > 0) {
      setCurrentId(tenants[0].id);
    }
  }, [tenants, currentId]);

  const setCurrentTenantId = (id: string | null) => {
    setCurrentId(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  };
  const setCentralMode = (v: boolean) => {
    setCentralModeState(v);
    localStorage.setItem(CENTRAL_KEY, v ? "1" : "0");
  };

  const currentTenant = tenants.find((t) => t.id === currentId) ?? null;

  // apply accent color as CSS var
  useEffect(() => {
    if (currentTenant?.accent_color) {
      document.documentElement.style.setProperty("--tenant-accent", currentTenant.accent_color);
    }
  }, [currentTenant]);

  return (
    <Ctx.Provider
      value={{
        currentTenant,
        tenants,
        setCurrentTenantId,
        centralMode,
        setCentralMode,
        isLoading,
        refetch,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTenant must be inside TenantProvider");
  return ctx;
}

export function useTenantId(): string {
  const { currentTenant } = useTenant();
  if (!currentTenant) throw new Error("No tenant selected");
  return currentTenant.id;
}
