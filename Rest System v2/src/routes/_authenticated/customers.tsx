import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { Badge } from "@/components/app/StatCard";
import { UserCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;

  const { data: customers = [] } = useQuery({
    queryKey: ["customers", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select("*, customer_products(id, status, products(name))")
        .eq("tenant_id", tid!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AppShell
      title="Clientes"
      subtitle="Base pós-venda com produtos, entregas e histórico"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div key={c.id} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2 text-primary"><UserCircle className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.company ?? c.email ?? "—"}</div>
                </div>
              </div>
              <Badge tone={c.status === "ativo" ? "success" : c.status === "em_onboarding" ? "neon" : "muted"}>{c.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.customer_products?.map((cp) => (
                <span key={cp.id} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary neon-border">
                  {cp.products?.name}
                </span>
              ))}
              {(!c.customer_products || c.customer_products.length === 0) && (
                <span className="text-[10px] text-muted-foreground">Sem produtos vinculados</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Início: <span className="text-foreground">{c.start_date ? new Date(c.start_date).toLocaleDateString("pt-BR") : "—"}</span></div>
              <div>Renovação: <span className="text-foreground">{c.renewal_date ? new Date(c.renewal_date).toLocaleDateString("pt-BR") : "—"}</span></div>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="glass col-span-full rounded-xl p-12 text-center text-sm text-muted-foreground">
            Nenhum cliente ainda. Converta um lead para começar.
          </div>
        )}
      </div>
    </AppShell>
  );
}
