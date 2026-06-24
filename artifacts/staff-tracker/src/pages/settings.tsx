import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const permissions = [
    "Add new staff members",
    "Remove / purge staff records",
    "Edit all stats (weekly & monthly)",
    "Issue written warnings",
    "Issue activity strikes",
    "Issue final strikes",
    "Override staff status (Active / LOA / Suspended / Terminated)",
    "View all dashboard data",
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Terminal access configuration</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Access Level
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-lg px-5 py-4">
              <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <div className="text-lg font-bold font-display text-primary">HQ — Full Access</div>
                <div className="text-xs font-mono text-muted-foreground mt-0.5">All permissions granted. No restrictions.</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Granted Permissions</h3>
              <ul className="space-y-2">
                {permissions.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm font-mono text-foreground">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
