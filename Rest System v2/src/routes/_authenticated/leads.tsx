import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Badge } from "@/components/app/StatCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Flame, Snowflake, Thermometer, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

const TEMP_ICON = { frio: Snowflake, morno: Thermometer, quente: Flame } as const;
const TEMP_TONE = { frio: "muted", morno: "warning", quente: "danger" } as const;

function LeadsPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("tenant_id", tid!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = leads.filter((l) =>
    !q ||
    l.name.toLowerCase().includes(q.toLowerCase()) ||
    (l.phone ?? "").includes(q) ||
    (l.company ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Leads"
      subtitle="Base completa de contatos com temperatura, tags e responsáveis"
      actions={<NewLeadDialog tenantId={tid!} onCreated={() => qc.invalidateQueries({ queryKey: ["leads", tid] })} />}
    >
      <div className="glass rounded-xl">
        <div className="flex items-center gap-2 border-b border-border/60 p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, empresa..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 border-0 bg-background/40 pl-9"
            />
          </div>
          <Badge tone="muted">{filtered.length} lead(s)</Badge>
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Temperatura</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Criado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const Icon = TEMP_ICON[l.temperature ?? "frio"];
                return (
                  <tr key={l.id} className="border-b border-border/40 transition hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{l.phone ?? "—"}</div>
                      <div className="text-xs">{l.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.source ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Icon className="h-3.5 w-3.5" />
                        <Badge tone={TEMP_TONE[l.temperature ?? "frio"]}>{l.temperature}</Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge>{l.status}</Badge></td>
                    <td className="px-4 py-3 text-xs">
                      {(l.tags ?? []).slice(0, 3).map((t) => (
                        <span key={t} className="mr-1 inline-block rounded-full bg-secondary px-2 py-0.5">{t}</span>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    Nenhum lead. Comece cadastrando o primeiro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function NewLeadDialog({ tenantId, onCreated }: { tenantId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", company: "", source: "", tags: "",
    temperature: "frio" as "frio" | "morno" | "quente",
    notes: "",
  });

  const m = useMutation({
    mutationFn: async () => {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { error } = await supabase.from("leads").insert({
        tenant_id: tenantId,
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        company: form.company || null,
        source: form.source || null,
        temperature: form.temperature,
        tags,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead criado");
      setOpen(false);
      setForm({ name: "", phone: "", email: "", company: "", source: "", tags: "", temperature: "frio", notes: "" });
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" />Novo lead</Button>
      </DialogTrigger>
      <DialogContent className="glass-strong sm:max-w-lg">
        <DialogHeader><DialogTitle>Novo lead</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nome *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Empresa</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Origem</Label>
            <Input placeholder="Instagram, indicação..." value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Temperatura</Label>
            <select
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value as "frio" | "morno" | "quente" })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="frio">Frio</option>
              <option value="morno">Morno</option>
              <option value="quente">Quente</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Tags (separadas por vírgula)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => m.mutate()} disabled={!form.name || m.isPending}>
            {m.isPending ? "Salvando..." : "Criar lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
