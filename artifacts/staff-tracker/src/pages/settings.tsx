import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Check, Lock, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { AdminLoginModal } from "@/components/admin-login-modal";

export default function Settings() {
  const { isAdmin, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const adminPermissions = [
    "Add new staff members",
    "Remove staff records",
    "Edit name, rank, division",
    "Edit stats (voice hours, messages, events, mini-events)",
    "Issue written warnings",
    "Issue activity strikes",
    "Issue final strikes",
    "Override staff status (Active / LOA / Suspended / Terminated)",
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Access control & system configuration</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              {isAdmin ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isAdmin ? (
              <>
                <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-bold font-display text-primary">Logged in as Admin</div>
                      <div className="text-xs font-mono text-muted-foreground mt-0.5">Full access — all controls unlocked</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout} className="font-mono text-xs uppercase text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-400">
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Logout
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Permissions</h3>
                  <ul className="space-y-2">
                    {adminPermissions.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-sm font-mono text-foreground">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 bg-muted/30 border border-border rounded-lg px-5 py-4">
                  <Lock className="w-7 h-7 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-bold font-display">Viewing in Read-Only Mode</div>
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">Login as admin to edit staff, issue warnings, and more</div>
                  </div>
                </div>

                <Button onClick={() => setLoginOpen(true)} className="w-full font-mono uppercase tracking-widest">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Permissions (locked)</h3>
                  <ul className="space-y-2">
                    {adminPermissions.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-sm font-mono text-muted-foreground">
                        <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
