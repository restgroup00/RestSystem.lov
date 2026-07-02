import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { SectionCard, Badge } from "@/components/app/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant";
import { UserCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

function UsersPage() {
  const { currentTenant } = useTenant();
  const tid = currentTenant?.id;

  const { data: members = [] } = useQuery({
    queryKey: ["members", tid],
    enabled: !!tid,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_members")
        .select("*")
        .eq("tenant_id", tid!);
      return data ?? [];
    },
  });

  return (
    <AppShell title="Usuários & permissões" subtitle="Papéis específicos por empresa (admin, gestor, SDR, closer, etc.)">
      <SectionCard title="Membros">
        <div className="divide-y divide-border/40">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary"><UserCircle className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-medium">Usuário</div>
                  <div className="text-xs text-muted-foreground">{m.user_id.slice(0, 8)}...</div>
                </div>
              </div>
              <Badge tone="neon">{m.role}</Badge>
            </div>
          ))}
          {members.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Você é o único membro por enquanto.</div>}
        </div>
      </SectionCard>
    </AppShell>
  );
}
