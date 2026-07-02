import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { Badge } from "@/components/app/StatCard";

export const Route = createFileRoute("/_authenticated/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;

  const { data } = useQuery({
    queryKey: ["pipeline", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data: pipes } = await supabase.from("pipelines").select("*").eq("tenant_id", tid!).order("is_default", { ascending: false });
      const pipe = pipes?.[0];
      if (!pipe) return { stages: [], leads: [] };
      const [{ data: stages }, { data: leads }] = await Promise.all([
        supabase.from("stages").select("*").eq("pipeline_id", pipe.id).order("position"),
        supabase.from("leads").select("*").eq("tenant_id", tid!),
      ]);
      return { stages: stages ?? [], leads: leads ?? [] };
    },
  });

  const stages = data?.stages ?? [];
  const leads = data?.leads ?? [];

  return (
    <AppShell title="Funil de vendas" subtitle="Kanban editável — arraste leads entre etapas">
      <div className="scroll-thin flex gap-3 overflow-x-auto pb-4">
        {stages.map((s) => {
          const items = leads.filter((l) => l.stage_id === s.id);
          return (
            <div key={s.id} className="glass flex w-72 shrink-0 flex-col rounded-xl">
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color ?? "var(--neon)" }} />
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <Badge tone="muted">{items.length}</Badge>
              </div>
              <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-2" style={{ minHeight: 300 }}>
                {items.map((l) => (
                  <div key={l.id} className="cursor-grab rounded-lg border border-border/60 bg-card/70 p-3 transition hover:border-primary/40">
                    <div className="text-sm font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.company ?? l.phone ?? "—"}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(l.tags ?? []).slice(0, 2).map((t) => (
                        <span key={t} className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-xs text-muted-foreground">
                    Vazio
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {stages.length === 0 && (
          <div className="glass mx-auto max-w-md rounded-xl p-8 text-center text-sm text-muted-foreground">
            Nenhum funil configurado. Crie uma empresa primeiro.
          </div>
        )}
      </div>
    </AppShell>
  );
}
