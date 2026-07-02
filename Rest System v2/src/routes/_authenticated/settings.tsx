import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { SectionCard } from "@/components/app/StatCard";
import { useTenant } from "@/lib/tenant";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { currentTenant, refetch } = useTenant();
  const [name, setName] = useState("");
  const [accent, setAccent] = useState("");

  useEffect(() => {
    if (currentTenant) {
      setName(currentTenant.name);
      setAccent(currentTenant.accent_color ?? "#00ffb2");
    }
  }, [currentTenant]);

  async function save() {
    if (!currentTenant) return;
    const { error } = await supabase.from("tenants").update({ name, accent_color: accent }).eq("id", currentTenant.id);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    refetch();
  }

  return (
    <AppShell title="Configurações" subtitle="Identidade visual, nome e preferências desta empresa">
      <SectionCard title="Empresa">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Cor neon</Label><div className="flex gap-2"><Input value={accent} onChange={(e) => setAccent(e.target.value)} /><input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-9 w-12 rounded border border-input bg-transparent" /></div></div>
        </div>
        <Button onClick={save} className="mt-4">Salvar</Button>
      </SectionCard>
    </AppShell>
  );
}
