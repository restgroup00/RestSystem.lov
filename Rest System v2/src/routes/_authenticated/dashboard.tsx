import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { StatCard, SectionCard, Badge } from "@/components/app/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import {
  Users, MessageSquare, Clock, Target, TrendingUp, Bot, AlertTriangle, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { currentTenant, centralMode } = useTenant();
  const tid = currentTenant?.id;
  const enabled = !!tid && !centralMode;

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", tid],
    enabled,
    queryFn: async () => {
      const [leads, followups, msgs, customers] = await Promise.all([
        supabase.from("leads").select("id,status,temperature,created_at", { count: "exact" }).eq("tenant_id", tid!),
        supabase.from("followups").select("id,status,scheduled_at", { count: "exact" }).eq("tenant_id", tid!).eq("status", "pendente"),
        supabase.from("messages").select("id,role,created_at").eq("tenant_id", tid!).order("created_at", { ascending: false }).limit(500),
        supabase.from("customers").select("id", { count: "exact", head: true }).eq("tenant_id", tid!),
      ]);
      const all = leads.data ?? [];
      const total = all.length;
      const won = all.filter((l) => l.status === "cliente").length;
      const lost = all.filter((l) => l.status === "perdido").length;
      const inProgress = all.filter((l) => l.status === "em_andamento").length;
      const news = all.filter((l) => l.status === "novo").length;
      const followupCount = all.filter((l) => l.status === "follow_up").length;
      const conv = total ? Math.round((won / total) * 100) : 0;
      const hot = all.filter((l) => l.temperature === "quente").length;
      return {
        total, won, lost, inProgress, news, followupCount, conv, hot,
        pendingFollowups: followups.count ?? 0,
        todayFollowups:
          (followups.data ?? []).filter(
            (f) => new Date(f.scheduled_at).toDateString() === new Date().toDateString(),
          ).length,
        totalMessages: msgs.data?.length ?? 0,
        customers: customers.count ?? 0,
      };
    },
  });

  return (
    <AppShell
      title="Visão geral"
      subtitle="Panorama executivo e operacional da sua empresa em tempo real"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Leads novos" value={stats?.news ?? 0} icon={Users} tone="neon" />
        <StatCard label="Em andamento" value={stats?.inProgress ?? 0} icon={MessageSquare} />
        <StatCard label="Em follow-up" value={stats?.followupCount ?? 0} icon={Clock} tone="warning" />
        <StatCard label="Convertidos" value={stats?.won ?? 0} hint={`Taxa: ${stats?.conv ?? 0}%`} icon={Target} tone="success" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Leads quentes" value={stats?.hot ?? 0} icon={TrendingUp} tone="neon" />
        <StatCard label="Follow-ups hoje" value={stats?.todayFollowups ?? 0} icon={Clock} />
        <StatCard label="Mensagens (últimas 500)" value={stats?.totalMessages ?? 0} icon={MessageSquare} />
        <StatCard label="Clientes ativos" value={stats?.customers ?? 0} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Performance da IA">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold neon-text">92%</div>
              <div className="text-xs text-muted-foreground">Taxa de sugestão aceita (mock)</div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Conversas assistidas</span><span className="font-medium text-foreground">142</span></div>
            <div className="flex justify-between"><span>Requer intervenção humana</span><span className="font-medium text-foreground">7</span></div>
            <div className="flex justify-between"><span>Automação ativa</span><Badge tone="neon">Ligada</Badge></div>
          </div>
        </SectionCard>

        <SectionCard title="Alertas importantes">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--warning)]" />
              <span><b>{stats?.hot ?? 0} lead(s) quente(s)</b> sem resposta nas últimas 24h.</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-primary" />
              <span><b>{stats?.pendingFollowups ?? 0} follow-up(s)</b> pendentes na fila.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--success)]" />
              <span>Nenhuma entrega atrasada.</span>
            </li>
          </ul>
        </SectionCard>

        <SectionCard title="Tarefas pendentes do dia">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
              <span>Revisar propostas enviadas</span>
              <Badge tone="warning">Alta</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
              <span>Retomar leads perdidos há 30d</span>
              <Badge tone="muted">Média</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
              <span>Publicar scripts atualizados</span>
              <Badge>Normal</Badge>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
