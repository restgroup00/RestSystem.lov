import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { SectionCard, Badge } from "@/components/app/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/_authenticated/logs")({
  component: LogsPage,
});

function LogsPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;

  const { data: logs = [] } = useQuery({
    queryKey: ["logs", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase.from("ai_logs").select("*").eq("tenant_id", tid!).order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  return (
    <AppShell title="Logs & auditoria" subtitle="Rastreio de todas as ações automatizadas e humanas">
      <SectionCard title="Trilha completa">
        <div className="space-y-1.5 font-mono text-xs">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded border border-border/40 bg-background/40 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
                <Badge tone="neon">{l.action}</Badge>
              </div>
              <span className="text-muted-foreground">{l.lead_id?.slice(0, 8) ?? "—"}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Sem eventos registrados.</div>}
        </div>
      </SectionCard>
    </AppShell>
  );
}
