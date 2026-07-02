import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { FileIcon } from "lucide-react";
import { Badge } from "@/components/app/StatCard";

export const Route = createFileRoute("/_authenticated/files")({
  component: FilesPage,
});

function FilesPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;

  const { data: files = [] } = useQuery({
    queryKey: ["files", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase
        .from("files")
        .select("*, customers(name)")
        .eq("tenant_id", tid!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AppShell title="Arquivos" subtitle="Propostas, contratos, entregáveis e documentos por cliente">
      <div className="glass rounded-xl">
        <div className="border-b border-border/60 px-5 py-3 text-sm font-medium">Biblioteca</div>
        <div className="divide-y divide-border/40">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-5 py-3 transition hover:bg-accent/30">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><FileIcon className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.customers?.name ? `${f.customers.name} · ` : ""}{f.kind ?? "geral"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="muted">{f.kind ?? "arquivo"}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">Nenhum arquivo enviado ainda.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
