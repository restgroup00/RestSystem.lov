import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { StatCard, SectionCard, Badge } from "@/components/app/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { Globe, Users, TrendingUp, Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/central")({
  component: CentralPage,
});

function CentralPage() {
  const { tenants, setCentralMode } = useTenant();
  useEffect(() => { setCentralMode(true); }, [setCentralMode]);

  const { data } = useQuery({
    queryKey: ["central", tenants.map((t) => t.id).join(",")],
    enabled: tenants.length > 0,
    queryFn: async () => {
      const rows = await Promise.all(tenants.map(async (t) => {
        const [{ count: leads }, { count: customers }, { count: pending }] = await Promise.all([
          supabase.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", t.id),
          supabase.from("customers").select("id", { count: "exact", head: true }).eq("tenant_id", t.id),
          supabase.from("followups").select("id", { count: "exact", head: true }).eq("tenant_id", t.id).eq("status", "pendente"),
        ]);
        const { data: wonLeads } = await supabase.from("leads").select("id", { count: "exact" }).eq("tenant_id", t.id).in("status", ["cliente", "ganho"]);
        const won = wonLeads?.length ?? 0;
        const total = leads ?? 0;
        return {
          id: t.id, name: t.name, accent: t.accent_color,
          leads: total, customers: customers ?? 0, followups: pending ?? 0,
          conv: total ? Math.round((won / total) * 100) : 0,
        };
      }));
      return rows;
    },
  });

  const totalLeads = data?.reduce((a, r) => a + r.leads, 0) ?? 0;
  const totalCustomers = data?.reduce((a, r) => a + r.customers, 0) ?? 0;
  const topConv = data ? [...data].sort((a, b) => b.conv - a.conv)[0] : null;

  return (
    <AppShell
      title="Central de Operações"
      subtitle="Visão consolidada de todas as empresas — CEO Mode"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Empresas" value={tenants.length} icon={Building2} tone="neon" />
        <StatCard label="Leads totais" value={totalLeads} icon={Users} />
        <StatCard label="Clientes totais" value={totalCustomers} icon={TrendingUp} tone="success" />
        <StatCard label="Maior conversão" value={topConv ? `${topConv.name}` : "—"} hint={topConv ? `${topConv.conv}%` : ""} icon={Globe} />
      </div>

      <SectionCard title="Comparativo por empresa">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Clientes</th>
                <th className="px-4 py-3">Follow-ups</th>
                <th className="px-4 py-3">Conversão</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((r) => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: r.accent ?? "var(--neon)" }} />
                    {r.name}
                  </td>
                  <td className="px-4 py-3">{r.leads}</td>
                  <td className="px-4 py-3">{r.customers}</td>
                  <td className="px-4 py-3">{r.followups}</td>
                  <td className="px-4 py-3"><Badge tone="neon">{r.conv}%</Badge></td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-muted-foreground">Nenhuma empresa cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
