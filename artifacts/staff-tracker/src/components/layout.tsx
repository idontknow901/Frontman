import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, UserPlus, Settings, ShieldCheck, LogOut, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { isAdmin, login, logout } = useAuth();
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff", label: "Staff List", icon: Users },
    { href: "/add-staff", label: "Add Staff", icon: UserPlus },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const handleLogin = () => {
    const ok = login(pw);
    if (ok) {
      setPw("");
      setError(false);
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="bg-primary/20 p-2 rounded-md">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">RPB Tracker</h1>
            <p className="text-xs text-muted-foreground font-mono">STAFF MANAGEMENT</p>
          </div>
        </div>

        {/* Admin Section */}
        <div className="px-4 py-3 border-b border-border">
          {isAdmin ? (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-md px-3 py-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary font-mono">ADMIN MODE ON</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors font-mono"
              >
                <LogOut className="w-3 h-3" />
                Exit
              </button>
            </div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); handleLogin(); }}
              className="space-y-2"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Admin Login</p>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    onChange={e => { setPw(e.target.value); setError(false); }}
                    placeholder="Password..."
                    autoComplete="current-password"
                    className={`w-full h-8 px-2.5 pr-8 text-xs rounded-md border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary ${error ? "border-red-500 ring-1 ring-red-500" : "border-border"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-colors uppercase flex-shrink-0"
                >
                  Login
                </button>
              </div>
              {error && <p className="text-red-500 text-[10px] font-mono">Wrong password.</p>}
            </form>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
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

        {!isAdmin && (
          <div className="p-4 border-t border-border">
            <p className="text-[10px] font-mono text-muted-foreground text-center leading-relaxed">
              Read-only mode — login above to edit.
            </p>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {isAdmin && (
          <div className="bg-primary/10 border-b border-primary/30 px-6 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-primary font-bold">Admin mode active — all edit controls unlocked</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
