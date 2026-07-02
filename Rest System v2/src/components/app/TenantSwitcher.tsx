import { useState } from "react";
import { useTenant } from "@/lib/tenant";
import { Building2, Check, ChevronsUpDown, Globe, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TenantSwitcher() {
  const { tenants, currentTenant, setCurrentTenantId, centralMode, setCentralMode } = useTenant();
  const [open, setOpen] = useState(false);

  const label = centralMode ? "Central de Operações" : currentTenant?.name ?? "Selecionar empresa";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="glass h-9 gap-2 px-3 font-medium">
          {centralMode ? <Globe className="h-4 w-4 text-primary" /> : <Building2 className="h-4 w-4 text-primary" />}
          <span className="max-w-[180px] truncate">{label}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="glass-strong w-72 p-1">
        <div className="px-2 py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Empresas
        </div>
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {tenants.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhuma empresa. Crie a primeira.
            </div>
          )}
          {tenants.map((t) => {
            const active = !centralMode && currentTenant?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setCentralMode(false);
                  setCurrentTenantId(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent",
                  active && "bg-accent",
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: t.accent_color ?? "var(--neon)" }}
                />
                <span className="flex-1 truncate text-left">{t.name}</span>
                {active && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
        <div className="my-1 h-px bg-border" />
        <button
          onClick={() => {
            setCentralMode(true);
            setOpen(false);
          }}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent",
            centralMode && "bg-accent",
          )}
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="flex-1 text-left">Central de Operações</span>
          {centralMode && <Check className="h-3.5 w-3.5 text-primary" />}
        </button>
        <div className="my-1 h-px bg-border" />
        <Link
          to="/onboarding"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Nova empresa
        </Link>
      </PopoverContent>
    </Popover>
  );
}