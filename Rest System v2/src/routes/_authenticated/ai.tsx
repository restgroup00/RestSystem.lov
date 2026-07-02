import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { StatCard, SectionCard, Badge } from "@/components/app/StatCard";
import { Bot, Sparkles, ShieldCheck, Pause } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/_authenticated/ai")({
  component: AIPage,
});

function AIPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;

  const { data: logs = [] } = useQuery({
    queryKey: ["ai_logs", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase.from("ai_logs").select("*").eq("tenant_id", tid!).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  return (
    <AppShell title="Automação & IA" subtitle="Regras, aprendizado por empresa e logs de todas as ações">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Status geral" value="ATIVA" tone="neon" icon={Bot} />
        <StatCard label="Sugestões (24h)" value={logs.length} icon={Sparkles} />
        <StatCard label="Regras ativas" value={0} icon={ShieldCheck} />
        <StatCard label="Pausas manuais" value={0} icon={Pause} />
      </div>

      <SectionCard title="Logs recentes de IA">
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="rounded-md border border-border/60 bg-card/60 p-3 text-xs">
              <div className="flex items-center justify-between">
                <Badge tone="neon">{l.action}</Badge>
                <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
              </div>
              {l.output && <div className="mt-2 text-muted-foreground line-clamp-2">{typeof l.output === "string" ? l.output : JSON.stringify(l.output)}</div>}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Sem logs. A IA ainda não executou ações nesta empresa.</div>
          )}
        </div>
      </SectionCard>
    </AppShell>
  );
}
