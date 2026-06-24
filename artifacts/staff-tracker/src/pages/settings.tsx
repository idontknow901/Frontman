import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffMemberAccessLevel } from "@workspace/api-client-react";
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { role, setRole } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Configure terminal operations</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Role Simulator
            </CardTitle>
            <CardDescription>
              Change your active viewer role to preview the UI as different access levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Active Identity</label>
              <Select value={role} onValueChange={(v) => setRole(v as StaffMemberAccessLevel)}>
                <SelectTrigger className="w-full font-mono bg-background border-border">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StaffMemberAccessLevel.HQ}>HQ (Full Access)</SelectItem>
                  <SelectItem value={StaffMemberAccessLevel.Director}>Director (Admin)</SelectItem>
                  <SelectItem value={StaffMemberAccessLevel.Assistant_Director}>Assistant Director (Editor)</SelectItem>
                  <SelectItem value={StaffMemberAccessLevel.Staff}>Staff (View Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-background rounded border border-border p-4 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider">Current Permissions</h3>
              <ul className="text-sm space-y-2 font-mono text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${role === 'HQ' || role === 'Director' ? 'bg-green-500' : 'bg-red-500'}`} />
                  Add/Remove Staff
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${role !== 'Staff' ? 'bg-green-500' : 'bg-red-500'}`} />
                  Edit Statistics
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${role === 'HQ' || role === 'Director' ? 'bg-green-500' : 'bg-red-500'}`} />
                  Issue Final Strikes
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
