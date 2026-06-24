import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, UserPlus, Settings, Command } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff", label: "Staff List", icon: Users },
    { href: "/add-staff", label: "Add Staff", icon: UserPlus },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card flex-shrink-0 flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="bg-primary/20 p-2 rounded-md">
            <Command className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">OPS COMMAND</h1>
            <p className="text-xs text-muted-foreground font-mono">STAFF TRACKER</p>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Access</span>
            <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">
              Admin — Full
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
