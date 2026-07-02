import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { Badge } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/scripts")({
  component: ScriptsPage,
});

const TYPES = ["abertura", "qualificacao", "follow_up", "objecao", "agendamento", "fechamento", "reativacao", "ia_base"] as const;

function ScriptsPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: scripts = [] } = useQuery({
    queryKey: ["scripts", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase.from("scripts").select("*").eq("tenant_id", tid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = filter === "all" ? scripts : scripts.filter((s) => s.type === filter);

  return (
    <AppShell
      title="Scripts e playbooks"
      subtitle="Biblioteca central por etapa, produto e perfil de cliente"
      actions={<NewScriptDialog tenantId={tid!} onCreated={() => qc.invalidateQueries({ queryKey: ["scripts", tid] })} />}
    >
      <div className="flex flex-wrap gap-2">
        {["all", ...TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3 py-1 text-xs transition ${filter === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {t === "all" ? "Todos" : t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <Badge tone="neon">{s.type}</Badge>
                </div>
              </div>
              {(s.performance_score ?? 0) > 80 && (
                <span className="inline-flex items-center gap-1 text-xs text-primary"><Sparkles className="h-3 w-3" />Top</span>
              )}
            </div>
            <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">{s.content}</p>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>v{s.version ?? 1}</span>
              <span>Usos: {s.usage_count ?? 0}</span>
              <span>Score: {s.performance_score ?? 0}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass col-span-full rounded-xl p-12 text-center text-sm text-muted-foreground">Nenhum script.</div>
        )}
      </div>
    </AppShell>
  );
}

function NewScriptDialog({ tenantId, onCreated }: { tenantId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", type: "abertura" as typeof TYPES[number], content: "", notes: "" });

  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("scripts").insert({
        tenant_id: tenantId, name: f.name, type: f.type, content: f.content, notes: f.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Script criado");
      setOpen(false);
      setF({ name: "", type: "abertura", content: "", notes: "" });
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo script</Button></DialogTrigger>
      <DialogContent className="glass-strong sm:max-w-xl">
        <DialogHeader><DialogTitle>Novo script</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Nome *</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as typeof TYPES[number] })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Conteúdo *</Label><Textarea rows={8} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="Olá {{nome}}, tudo bem?..." /></div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Observações</Label><Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => m.mutate()} disabled={!f.name || !f.content || m.isPending}>{m.isPending ? "Salvando..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
