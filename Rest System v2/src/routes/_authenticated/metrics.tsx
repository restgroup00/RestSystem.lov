import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { StatCard, SectionCard } from "@/components/app/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { TrendingUp, Target, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/metrics")({
  component: MetricsPage,
});

function MetricsPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;

  const { data } = useQuery({
    queryKey: ["metrics", tid],
    enabled: !!tid,
    queryFn: async () => {
      const [{ data: leads }, { data: stages }] = await Promise.all([
        supabase.from("leads").select("id,stage_id,status,source,created_at").eq("tenant_id", tid!),
        supabase.from("stages").select("id,name,position").eq("tenant_id", tid!).order("position"),
      ]);
      const bySource = new Map<string, number>();
      (leads ?? []).forEach((l) => {
        const k = l.source ?? "sem origem";
        bySource.set(k, (bySource.get(k) ?? 0) + 1);
      });
      const byStage = (stages ?? []).map((s) => ({
        name: s.name,
        count: (leads ?? []).filter((l) => l.stage_id === s.id).length,
      }));
      const total = leads?.length ?? 0;
      const won = (leads ?? []).filter((l) => l.status === "cliente" || l.status === "ganho").length;
      return {
        total, won,
        conv: total ? Math.round((won / total) * 100) : 0,
        bySource: [...bySource.entries()],
        byStage,
      };
    },
  });

  return (
    <AppShell title="Métricas & relatórios" subtitle="Performance por etapa, origem, produto e responsável">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Leads totais" value={data?.total ?? 0} icon={Users} />
        <StatCard label="Conversão" value={`${data?.conv ?? 0}%`} tone="neon" icon={Target} />
        <StatCard label="Fechados" value={data?.won ?? 0} tone="success" icon={TrendingUp} />
        <StatCard label="Tempo médio resposta" value="—" icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Leads por etapa">
          <div className="space-y-2">
            {(data?.byStage ?? []).map((s) => {
              const max = Math.max(...(data?.byStage.map((x) => x.count) ?? [1]), 1);
              const pct = (s.count / max) * 100;
              return (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{s.name}</span><span className="text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%`, boxShadow: "0 0 10px var(--neon)" }} />
                  </div>
                </div>
              );
            })}
            {(data?.byStage.length ?? 0) === 0 && <div className="py-8 text-center text-sm text-muted-foreground">Sem dados.</div>}
          </div>
        </SectionCard>

        <SectionCard title="Leads por origem">
          <div className="space-y-2">
            {(data?.bySource ?? []).map(([src, count]) => (
              <div key={src} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm">
                <span>{src}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
            {(data?.bySource.length ?? 0) === 0 && <div className="py-8 text-center text-sm text-muted-foreground">Sem dados.</div>}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
