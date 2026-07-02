import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { StatCard, SectionCard, Badge } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Bot, Pause, Play, Send, Users, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/prospecting")({
  component: ProspectingPage,
});

function ProspectingPage() {
  const [aiOn, setAiOn] = useState(true);
  const [connected, setConnected] = useState(false);

  return (
    <AppShell
      title="Prospecção com IA"
      subtitle="Envio controlado, cadência inteligente e intervenção humana a qualquer momento"
      actions={
        <Button variant={aiOn ? "outline" : "default"} className="gap-2" onClick={() => {
          setAiOn((v) => !v);
          toast[aiOn ? "warning" : "success"](aiOn ? "Automação pausada globalmente" : "Automação retomada");
        }}>
          {aiOn ? <><Pause className="h-4 w-4" />Pausar tudo</> : <><Play className="h-4 w-4" />Retomar</>}
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Status da IA" value={aiOn ? "ATIVA" : "PAUSADA"} tone={aiOn ? "neon" : "warning"} icon={Bot} />
        <StatCard label="Mensagens hoje" value={0} icon={Send} />
        <StatCard label="Leads elegíveis" value={0} icon={Users} />
        <StatCard label="Cadência" value="3 msg / dia" icon={Zap} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Conexão WhatsApp"
          action={<Badge tone={connected ? "success" : "muted"}>{connected ? "Conectado" : "Desconectado"}</Badge>}
        >
          <p className="text-sm text-muted-foreground">
            Conecte o número que será usado para prospecção. A IA só atuará sobre leads presentes na base cadastrada nesta empresa.
          </p>
          <Button className="mt-4 w-full" onClick={() => { setConnected((v) => !v); toast.info(connected ? "Desconectado" : "Simulação: conectado"); }}>
            {connected ? "Desconectar" : "Conectar WhatsApp (simulação)"}
          </Button>
        </SectionCard>

        <SectionCard title="Regras da IA">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-primary" /> Atua apenas em contatos da base autorizada</li>
            <li className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-primary" /> Para automaticamente ao detectar interesse real ou fechamento</li>
            <li className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-primary" /> Respeita janela de horário e cadência</li>
            <li className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-primary" /> Não responde números fora da base</li>
          </ul>
        </SectionCard>

        <SectionCard title="Campanha rápida">
          <p className="text-sm text-muted-foreground">
            Selecione uma segmentação (tags, origem, produto) e a IA sugere abordagem inicial + cadência.
          </p>
          <Button className="mt-4 w-full" variant="outline" disabled>Em breve</Button>
        </SectionCard>
      </div>
    </AppShell>
  );
}