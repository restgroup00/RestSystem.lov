import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Users, MessageSquare, Kanban, Clock, Send, Package, FileText,
  Building2, Files, Bot, BarChart3, Settings, UserCog, Plug, ScrollText, Globe, LogOut, Search, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TenantSwitcher } from "./TenantSwitcher";
import { useTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/conversations", label: "Conversas", icon: MessageSquare },
  { to: "/pipeline", label: "Funil", icon: Kanban },
  { to: "/followup", label: "Follow-up", icon: Clock },
  { to: "/prospecting", label: "Prospecção", icon: Send },
  { to: "/products", label: "Produtos", icon: Package },
  { to: "/scripts", label: "Scripts", icon: FileText },
  { to: "/customers", label: "Clientes", icon: Building2 },
  { to: "/files", label: "Arquivos", icon: Files },
  { to: "/ai", label: "IA & Automação", icon: Bot },
  { to: "/metrics", label: "Métricas", icon: BarChart3 },
] as const;

const NAV_SECONDARY = [
  { to: "/settings", label: "Configurações", icon: Settings },
  { to: "/users", label: "Usuários", icon: UserCog },
  { to: "/integrations", label: "Integrações", icon: Plug },
  { to: "/logs", label: "Logs & Auditoria", icon: ScrollText },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTenant, centralMode } = useTenant();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
    toast.success("Sessão encerrada");
  }

  const needsTenant = !centralMode && !currentTenant;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar/50 md:flex md:flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 neon-border">
            <Zap className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Nexus CRM</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Central operacional
            </div>
          </div>
        </div>

        <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          <div className="mb-2 mt-2 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Operação
          </div>
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-primary")} />
                <span>{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full neon-dot" />}
              </Link>
            );
          })}

          <div className="mb-2 mt-6 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Sistema
          </div>
          {NAV_SECONDARY.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-primary")} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="mb-2 mt-6 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Multiempresa
          </div>
          <Link
            to="/central"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              location.pathname === "/central"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            <Globe className="h-4 w-4" />
            <span>Central de Operações</span>
          </Link>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 px-6 py-3">
          <TenantSwitcher />
          <div className="relative ml-2 hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar leads, clientes, produtos..."
              className="h-9 bg-background/40 pl-9"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </header>

        {needsTenant ? (
          <div className="flex flex-1 items-center justify-center p-10">
            <div className="glass max-w-md rounded-2xl p-8 text-center">
              <h2 className="text-lg font-semibold">Nenhuma empresa selecionada</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Crie sua primeira empresa para começar a operar.
              </p>
              <Link
                to="/onboarding"
                className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Criar empresa
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-6 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            {children}
          </div>
        )}
      </main>
    </div>
  );
}