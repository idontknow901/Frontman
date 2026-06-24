import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetStaff, getGetStaffQueryKey, useUpdateStats, useUpdateStaffStatus, 
  useIssueWarning, useDeleteStaff, WarningInputType 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2, ShieldAlert, Activity, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function StaffDetail() {
  const { id } = useParams();
  const staffId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEditStats, canIssueWarning, role } = useAuth();
  
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState({ voiceHours: 0, messages: 0, eventsHosted: 0, miniEventsHosted: 0 });
  const [warningDialog, setWarningDialog] = useState<{ isOpen: boolean; type: WarningInputType | null }>({ isOpen: false, type: null });

  const { data: staff, isLoading } = useGetStaff(staffId, { query: { enabled: !!staffId, queryKey: getGetStaffQueryKey(staffId) } });
  const updateStats = useUpdateStats();
  const updateStatus = useUpdateStaffStatus();
  const issueWarning = useIssueWarning();
  const deleteStaff = useDeleteStaff();

  if (isLoading || !staff) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'Active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'LOA': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Suspended': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'Terminated': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleStatusChange = (newStatus: any) => {
    updateStatus.mutate({ id: staffId, data: { status: newStatus } }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetStaffQueryKey(staffId), data);
        toast({ title: "Status Updated", description: `Operative status changed to ${newStatus}` });
      }
    });
  };

  const handleSaveStats = () => {
    updateStats.mutate({ id: staffId, data: { period, ...statsForm } }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetStaffQueryKey(staffId), data);
        setIsEditingStats(false);
        toast({ title: "Stats Updated", description: `Successfully recorded ${period} metrics.` });
      }
    });
  };

  const handleIssueWarning = (type: WarningInputType) => {
    issueWarning.mutate({ id: staffId, data: { type, note: "Admin issued via dashboard" } }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetStaffQueryKey(staffId), data);
        setWarningDialog({ isOpen: false, type: null });
        toast({ title: "Warning Issued", description: `Successfully recorded ${type}.`, variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    if(confirm(`Are you sure you want to permanently delete ${staff.name}? This action cannot be undone.`)) {
      deleteStaff.mutate({ id: staffId }, {
        onSuccess: () => {
          toast({ title: "Operative Terminated", description: "Record has been purged." });
          setLocation("/staff");
        }
      });
    }
  };

  const WarningBar = ({ count, type, label }: { count: number, type: 'written'|'activity'|'final', label: string }) => {
    const color = type === 'written' ? 'bg-yellow-500' : type === 'activity' ? 'bg-orange-500' : 'bg-red-500';
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono uppercase">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-bold">{count} / 3</span>
        </div>
        <div className="flex gap-1 h-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 rounded-sm ${i <= count ? color : 'bg-secondary'}`} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/staff" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            {staff.name}
            <span className={`text-xs px-2.5 py-1 rounded font-mono uppercase border ${getStatusColor(staff.status)}`}>
              {staff.status}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {staff.rank} • {staff.division} • Clearance: {staff.accessLevel}
          </p>
        </div>
        <div className="ml-auto">
          {role === 'HQ' && (
            <Button variant="destructive" size="sm" onClick={handleDelete} className="font-mono uppercase">
              <Trash2 className="w-4 h-4 mr-2" /> Purge Record
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm md:col-span-2">
          <CardHeader className="border-b border-border bg-muted/20 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Operational Metrics
            </CardTitle>
            <ToggleGroup type="single" value={period} onValueChange={(v) => { if(v) {setPeriod(v as any); setIsEditingStats(false);} }} className="bg-background border border-border p-1 rounded-md">
              <ToggleGroupItem value="weekly" className="h-7 px-3 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Weekly</ToggleGroupItem>
              <ToggleGroupItem value="monthly" className="h-7 px-3 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Monthly</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent className="p-6">
            {!isEditingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs uppercase font-mono text-muted-foreground mb-1">Voice Hrs</div>
                  <div className="text-3xl font-bold font-mono">{period === 'weekly' ? staff.weeklyVoiceHours : staff.monthlyVoiceHours}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-mono text-muted-foreground mb-1">Messages</div>
                  <div className="text-3xl font-bold font-mono">{period === 'weekly' ? staff.weeklyMessages : staff.monthlyMessages}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-mono text-muted-foreground mb-1">Events</div>
                  <div className="text-3xl font-bold font-mono">{period === 'weekly' ? staff.weeklyEventsHosted : staff.monthlyEventsHosted}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-mono text-muted-foreground mb-1">Mini-Events</div>
                  <div className="text-3xl font-bold font-mono">{period === 'weekly' ? staff.weeklyMiniEventsHosted : staff.monthlyMiniEventsHosted}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-muted-foreground">Voice Hrs</label>
                  <Input type="number" value={statsForm.voiceHours} onChange={e => setStatsForm(s => ({...s, voiceHours: +e.target.value}))} className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-muted-foreground">Messages</label>
                  <Input type="number" value={statsForm.messages} onChange={e => setStatsForm(s => ({...s, messages: +e.target.value}))} className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-muted-foreground">Events</label>
                  <Input type="number" value={statsForm.eventsHosted} onChange={e => setStatsForm(s => ({...s, eventsHosted: +e.target.value}))} className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-muted-foreground">Mini-Events</label>
                  <Input type="number" value={statsForm.miniEventsHosted} onChange={e => setStatsForm(s => ({...s, miniEventsHosted: +e.target.value}))} className="font-mono bg-background" />
                </div>
              </div>
            )}

            {canEditStats && (
              <div className="mt-6 flex justify-end border-t border-border pt-4">
                {isEditingStats ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingStats(false)} className="font-mono uppercase text-xs">Cancel</Button>
                    <Button onClick={handleSaveStats} className="font-mono uppercase text-xs" disabled={updateStats.isPending}>Save Data</Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => {
                    setStatsForm({
                      voiceHours: period === 'weekly' ? staff.weeklyVoiceHours : staff.monthlyVoiceHours,
                      messages: period === 'weekly' ? staff.weeklyMessages : staff.monthlyMessages,
                      eventsHosted: period === 'weekly' ? staff.weeklyEventsHosted : staff.monthlyEventsHosted,
                      miniEventsHosted: period === 'weekly' ? staff.weeklyMiniEventsHosted : staff.monthlyMiniEventsHosted,
                    });
                    setIsEditingStats(true);
                  }} className="font-mono uppercase text-xs">
                    Edit Metrics
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20 py-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Disciplinary Record
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <WarningBar count={staff.writtenWarnings} type="written" label="Written Warnings" />
            <WarningBar count={staff.activityStrikes} type="activity" label="Activity Strikes" />
            <WarningBar count={staff.finalStrikes} type="final" label="Final Strikes" />

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Admin Controls</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Override Status</label>
                <Select value={staff.status} onValueChange={handleStatusChange} disabled={!canIssueWarning}>
                  <SelectTrigger className="font-mono bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Set Active</SelectItem>
                    <SelectItem value="LOA">Place on LOA</SelectItem>
                    <SelectItem value="Suspended">Suspend</SelectItem>
                    {canIssueWarning && <SelectItem value="Terminated">Terminate</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {canIssueWarning && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Button variant="outline" className="w-full justify-start text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500 border-yellow-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.written })}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Issue Written
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-orange-500 hover:bg-orange-500/10 hover:text-orange-500 border-orange-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.activityStrike })}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Issue Activity Strike
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500 border-red-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.finalStrike })}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Issue Final Strike
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={warningDialog.isOpen} onOpenChange={(v) => !v && setWarningDialog({ isOpen: false, type: null })}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Confirm Disciplinary Action
            </DialogTitle>
            <DialogDescription className="font-mono text-sm pt-2">
              You are about to issue a <strong>{warningDialog.type?.replace(/([A-Z])/g, ' $1').toUpperCase()}</strong> to {staff.name}. 
              This action will be permanently recorded in their dossier.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setWarningDialog({ isOpen: false, type: null })} className="font-mono uppercase text-xs">Abort</Button>
            <Button variant="destructive" onClick={() => warningDialog.type && handleIssueWarning(warningDialog.type)} disabled={issueWarning.isPending} className="font-mono uppercase text-xs">
              {issueWarning.isPending ? "Transmitting..." : "Confirm & Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
