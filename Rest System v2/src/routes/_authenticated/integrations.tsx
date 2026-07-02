import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { SectionCard, Badge } from "@/components/app/StatCard";
import { MessageCircle, Mail, Calendar, Webhook } from "lucide-react";

export const Route = createFileRoute("/_authenticated/integrations")({
  component: IntegrationsPage,
});

const items = [
  { name: "WhatsApp", desc: "Conecte para enviar/receber (simulação nesta versão)", icon: MessageCircle, status: "Simulado" },
  { name: "E-mail", desc: "SMTP para follow-ups e notificações", icon: Mail, status: "Em breve" },
  { name: "Agenda", desc: "Google Calendar para reuniões", icon: Calendar, status: "Em breve" },
  { name: "Webhooks", desc: "Envie eventos para sistemas externos", icon: Webhook, status: "Em breve" },
];

function IntegrationsPage() {
  return (
    <AppShell title="Integrações" subtitle="Conecte canais e ferramentas ao seu ambiente">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <SectionCard key={i.name} title={i.name} action={<Badge tone="muted">{i.status}</Badge>}>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary"><i.icon className="h-5 w-5" /></div>
              <p className="text-sm text-muted-foreground">{i.desc}</p>
            </div>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
