import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { Badge, SectionCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, SkipForward, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/followup")({
  component: FollowupPage,
});

function FollowupPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;
  const qc = useQueryClient();

  const { data: rows = [] } = useQuery({
    queryKey: ["followups", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase
        .from("followups")
        .select("*, leads(name, phone, temperature, company)")
        .eq("tenant_id", tid!)
        .order("scheduled_at");
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "concluido" | "pulado" | "cancelado" }) => {
      const { error } = await supabase.from("followups").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Atualizado");
      qc.invalidateQueries({ queryKey: ["followups", tid] });
    },
  });

  const pending = rows.filter((r) => r.status === "pendente");
  const today = pending.filter((r) => new Date(r.scheduled_at).toDateString() === new Date().toDateString());
  const late = pending.filter((r) => new Date(r.scheduled_at) < new Date() && !today.includes(r));

  return (
    <AppShell title="Follow-up" subtitle="Fila inteligente com cadência, prioridade e histórico">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Pendentes</div>
          <div className="mt-2 text-3xl font-semibold neon-text">{pending.length}</div>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Para hoje</div>
          <div className="mt-2 text-3xl font-semibold">{today.length}</div>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Atrasados</div>
          <div className="mt-2 text-3xl font-semibold text-destructive">{late.length}</div>
        </div>
      </div>

      <SectionCard title="Fila de follow-up">
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">{r.leads?.name ?? "Lead"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.leads?.company ?? r.leads?.phone ?? "—"} · Tentativa {r.attempt ?? 1}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={r.status === "pendente" ? "warning" : r.status === "concluido" ? "success" : "muted"}>
                  {r.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.scheduled_at).toLocaleString("pt-BR")}
                </span>
                {r.status === "pendente" && (
                  <div className="ml-2 flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => update.mutate({ id: r.id, status: "concluido" })}>
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => update.mutate({ id: r.id, status: "pulado" })}>
                      <SkipForward className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => update.mutate({ id: r.id, status: "cancelado" })}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum follow-up. Agende a partir de um lead.
            </div>
          )}
        </div>
      </SectionCard>
    </AppShell>
  );
}
