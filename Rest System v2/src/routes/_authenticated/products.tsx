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
import { Plus, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;
  const qc = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("tenant_id", tid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AppShell
      title="Produtos e serviços"
      subtitle="Catálogo com preço, escopo, entrega e associação com funis"
      actions={<NewProductDialog tenantId={tid!} onCreated={() => qc.invalidateQueries({ queryKey: ["products", tid] })} />}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.category ?? "Sem categoria"}</div>
                </div>
              </div>
              <Badge tone={p.is_active ? "success" : "muted"}>{p.is_active ? "Ativo" : "Inativo"}</Badge>
            </div>
            {p.description && <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">{p.description}</p>}
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-muted-foreground">Preço</div><div className="font-medium neon-text">R$ {Number(p.price ?? 0).toFixed(2)}</div></div>
              <div><div className="text-muted-foreground">Custo</div><div className="font-medium">R$ {Number(p.cost ?? 0).toFixed(2)}</div></div>
              <div><div className="text-muted-foreground">Entrega</div><div className="font-medium">{p.delivery_days ?? "—"}d</div></div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="glass col-span-full rounded-xl p-12 text-center text-sm text-muted-foreground">
            Nenhum produto cadastrado.
          </div>
        )}
      </div>
    </AppShell>
  );
}

function NewProductDialog({ tenantId, onCreated }: { tenantId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", description: "", category: "", price: "", cost: "", delivery_days: "", scope: "" });

  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("products").insert({
        tenant_id: tenantId,
        name: f.name,
        description: f.description || null,
        category: f.category || null,
        price: f.price ? Number(f.price) : null,
        cost: f.cost ? Number(f.cost) : null,
        delivery_days: f.delivery_days ? Number(f.delivery_days) : null,
        scope: f.scope || null,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produto criado");
      setOpen(false);
      setF({ name: "", description: "", category: "", price: "", cost: "", delivery_days: "", scope: "" });
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo produto</Button></DialogTrigger>
      <DialogContent className="glass-strong sm:max-w-lg">
        <DialogHeader><DialogTitle>Novo produto/serviço</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5"><Label>Nome *</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Categoria</Label><Input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Entrega (dias)</Label><Input type="number" value={f.delivery_days} onChange={(e) => setF({ ...f, delivery_days: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Preço (R$)</Label><Input type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Custo (R$)</Label><Input type="number" step="0.01" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Descrição</Label><Textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Escopo</Label><Textarea rows={3} value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => m.mutate()} disabled={!f.name || m.isPending}>{m.isPending ? "Salvando..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
