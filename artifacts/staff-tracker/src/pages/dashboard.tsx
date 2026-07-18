import { useGetDashboardSummary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users, Activity, PauseCircle, UserMinus } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">RPB Tracker</h1>
          <p className="text-muted-foreground mt-1">Loading dashboard...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return <div className="p-8 text-red-500 font-mono">Failed to load dashboard data.</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">RPB Tracker</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Staff overview & operations summary</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          { label: "Total Staff", value: summary.totalStaff, icon: Users, color: "text-primary", border: "" },
          { label: "Active", value: summary.activeStaff, icon: Activity, color: "text-green-500", border: "border-l-4 border-l-green-500" },
          { label: "LOA", value: summary.loaStaff, icon: PauseCircle, color: "text-yellow-500", border: "border-l-4 border-l-yellow-500" },
          { label: "Suspended", value: summary.suspendedStaff, icon: AlertCircle, color: "text-orange-500", border: "border-l-4 border-l-orange-500" },
          { label: "Terminated", value: summary.terminatedStaff, icon: UserMinus, color: "text-red-500", border: "border-l-4 border-l-red-500" },
        ].map(({ label, value, icon: Icon, color, border }) => (
          <motion.div key={label} variants={item}>
            <Card className={`bg-card border-border shadow-sm ${border}`}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</CardTitle>
                <Icon className={`w-4 h-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Divisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono">Event</span>
              <span className="font-bold font-mono text-primary">{summary.eventDivisionCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono">Training</span>
              <span className="font-bold font-mono text-primary">{summary.trainingDivisionCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Warnings Issued</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-yellow-500">Written</span>
              <span className="font-bold font-mono">{summary.totalWrittenWarnings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-orange-500">Activity Strikes</span>
              <span className="font-bold font-mono">{summary.totalActivityStrikes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-red-500">Final Strikes</span>
              <span className="font-bold font-mono">{summary.totalFinalStrikes}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-sm h-full">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Top Performers: Voice Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {summary.topPerformersByVoiceHours.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No data yet</div>
                ) : (
                  summary.topPerformersByVoiceHours.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold border border-primary/20">
                          #{i + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.rank} • {s.division}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{s.weeklyVoiceHours}h</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Weekly</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border shadow-sm h-full">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Top Performers: Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {summary.topPerformersByEvents.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No data yet</div>
                ) : (
                  summary.topPerformersByEvents.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold border border-primary/20">
                          #{i + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.rank} • {s.division}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{s.weeklyEventsHosted + s.weeklyMiniEventsHosted}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Events + Mini</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
