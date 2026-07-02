import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { useState } from "react";
import { Badge } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Pause, Play, Send, Sparkles, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/conversations")({
  component: ConversationsPage,
});

function ConversationsPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { data: convs = [] } = useQuery({
    queryKey: ["conversations", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*, leads(name, phone, temperature)")
        .eq("tenant_id", tid!)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      return data ?? [];
    },
  });

  const current = convs.find((c) => c.id === selected) ?? convs[0];

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", current?.id],
    enabled: !!current?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", current!.id)
        .order("created_at");
      return data ?? [];
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!current || !draft.trim()) return;
      const { error } = await supabase.from("messages").insert({
        tenant_id: tid!,
        conversation_id: current.id,
        role: "agent",
        content: draft.trim(),
        status: "sent",
      });
      if (error) throw error;
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", current.id);
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", current?.id] });
      qc.invalidateQueries({ queryKey: ["conversations", tid] });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleAi = useMutation({
    mutationFn: async () => {
      if (!current) return;
      await supabase
        .from("conversations")
        .update({ ai_enabled: !(current.ai_enabled ?? true) })
        .eq("id", current.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations", tid] }),
  });

  return (
    <AppShell title="Conversas" subtitle="CRM de WhatsApp — histórico completo, controle da IA e intervenção humana">
      <div className="glass grid h-[calc(100vh-13rem)] grid-cols-12 overflow-hidden rounded-xl">
        <div className="col-span-4 border-r border-border/60">
          <div className="border-b border-border/60 p-3">
            <Input placeholder="Buscar conversa..." className="h-9 border-0 bg-background/40" />
          </div>
          <div className="scroll-thin h-full overflow-y-auto">
            {convs.map((c) => {
              const aiOn = c.ai_enabled ?? true;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-border/40 px-4 py-3 text-left transition hover:bg-accent/40",
                    current?.id === c.id && "bg-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{c.leads?.name ?? "Sem lead"}</span>
                    {aiOn ? <Badge tone="neon">IA ativa</Badge> : <Badge tone="warning">IA pausada</Badge>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.leads?.phone ?? "—"}
                  </div>
                </button>
              );
            })}
            {convs.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma conversa. Elas aparecerão aqui quando iniciarem.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-8 flex flex-col">
          {current ? (
            <>
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                <div>
                  <div className="text-sm font-medium">{current.leads?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {current.leads?.phone ?? "—"} · Temp: {current.leads?.temperature}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggleAi.mutate()}>
                    {current.ai_enabled ?? true ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {current.ai_enabled ?? true ? "Pausar IA" : "Retomar IA"}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5"><User2 className="h-3.5 w-3.5" />Assumir</Button>
                </div>
              </div>
              <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-5">
                {messages.map((m) => {
                  const mine = m.role === "agent" || m.role === "ai";
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-3.5 py-2 text-sm",
                        mine ? "bg-primary/15 text-foreground neon-border" : "bg-secondary",
                      )}>
                        {m.role === "ai" && (
                          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary">
                            <Bot className="h-3 w-3" />IA
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{m.content}</div>
                        <div className="mt-1 text-right text-[10px] text-muted-foreground">
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="py-16 text-center text-sm text-muted-foreground">Sem mensagens ainda.</div>
                )}
              </div>
              <div className="border-t border-border/60 p-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" title="Sugestão da IA"><Sparkles className="h-4 w-4 text-primary" /></Button>
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    onKeyDown={(e) => e.key === "Enter" && send.mutate()}
                    className="h-10 border-0 bg-background/60"
                  />
                  <Button onClick={() => send.mutate()} disabled={!draft.trim() || send.isPending} className="gap-1.5">
                    <Send className="h-4 w-4" />Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Selecione uma conversa
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
