import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTenant } from "@/lib/tenant";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

const ACCENTS = [
  { name: "Ciano", value: "#00ffb2" },
  { name: "Dourado", value: "#ffd166" },
  { name: "Azul", value: "#4cc9f0" },
  { name: "Verde", value: "#38f5a4" },
  { name: "Roxo", value: "#b892ff" },
  { name: "Rosa", value: "#ff5eae" },
];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { setCurrentTenantId, refetch } = useTenant();
  const [name, setName] = useState("");
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Sem sessão");

      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
      const { data: tenant, error } = await supabase
        .from("tenants")
        .insert({ name: name.trim(), slug, accent_color: accent, created_by: uid })
        .select()
        .single();
      if (error) throw error;

      // default pipeline + stages
      const { data: pipe } = await supabase
        .from("pipelines")
        .insert({ tenant_id: tenant.id, name: "Funil Comercial", is_default: true })
        .select().single();

      if (pipe) {
        const stages = [
          { name: "Novo lead", position: 0, color: "#4cc9f0" },
          { name: "Primeiro contato", position: 1, color: "#4895ef" },
          { name: "Respondeu", position: 2, color: "#4361ee" },
          { name: "Qualificação", position: 3, color: "#7209b7" },
          { name: "Interesse real", position: 4, color: "#b5179e" },
          { name: "Reunião agendada", position: 5, color: "#f72585" },
          { name: "Proposta enviada", position: 6, color: "#ffbe0b" },
          { name: "Negociação", position: 7, color: "#fb8500" },
          { name: "Fechamento", position: 8, color: "#ff5714" },
          { name: "Cliente ganho", position: 9, color: "#38f5a4", is_won: true },
          { name: "Perdido", position: 10, color: "#8d99ae", is_lost: true },
        ];
        await supabase.from("stages").insert(
          stages.map((s) => ({ ...s, tenant_id: tenant.id, pipeline_id: pipe.id })),
        );
      }

      await refetch();
      setCurrentTenantId(tenant.id);
      toast.success(`Empresa "${tenant.name}" criada!`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar empresa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-lg rounded-2xl p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 neon-border">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Nova empresa
            </div>
            <h1 className="text-xl font-semibold">Configure seu ambiente</h1>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da empresa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: BlackBelt Growth"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Cor neon</Label>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAccent(a.value)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                    accent === a.value ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: a.value, boxShadow: `0 0 10px ${a.value}` }} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={create} disabled={loading || !name.trim()} className="w-full">
            {loading ? "Criando..." : "Criar empresa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
