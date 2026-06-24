import { useGetDashboardSummary } from "@workspace/api-client-react";
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
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">System summary and key metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return <div>Failed to load dashboard.</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">System summary & operations overview</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <motion.div variants={item}>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Staff</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{summary.totalStaff}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card border-border shadow-sm border-l-4 border-l-green-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active</CardTitle>
              <Activity className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{summary.activeStaff}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card border-border shadow-sm border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">LOA</CardTitle>
              <PauseCircle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{summary.loaStaff}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card border-border shadow-sm border-l-4 border-l-orange-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Suspended</CardTitle>
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{summary.suspendedStaff}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card border-border shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Terminated</CardTitle>
              <UserMinus className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{summary.terminatedStaff}</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
           <Card className="bg-card border-border shadow-sm h-full">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Top Performers: Voice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {summary.topPerformersByVoiceHours.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No data available</div>
                ) : (
                  summary.topPerformersByVoiceHours.map((staff, i) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold border border-primary/20">
                          #{i+1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{staff.name}</div>
                          <div className="text-xs text-muted-foreground">{staff.rank} • {staff.division}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{staff.weeklyVoiceHours}h</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Weekly</div>
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
                  <div className="p-8 text-center text-muted-foreground text-sm">No data available</div>
                ) : (
                  summary.topPerformersByEvents.map((staff, i) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold border border-primary/20">
                          #{i+1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{staff.name}</div>
                          <div className="text-xs text-muted-foreground">{staff.rank} • {staff.division}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{staff.weeklyEventsHosted}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Weekly</div>
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
