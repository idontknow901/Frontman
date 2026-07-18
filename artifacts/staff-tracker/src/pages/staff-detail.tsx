import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetStaff, getGetStaffQueryKey, useUpdateStats, useUpdateStaffStatus,
  useIssueWarning, useRemoveWarning, useDeleteStaff, useUpdateStaff, WarningInputType
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
import { AlertTriangle, Trash2, ShieldAlert, Activity, ArrowLeft, Pencil, Check, X, Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { triggerLiveUpdate } from "@/lib/firebase";

export default function StaffDetail() {
  const { id } = useParams();
  const staffId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [statsForm, setStatsForm] = useState({ voiceHours: 0, messages: 0, eventsHosted: 0, miniEventsHosted: 0 });
  const [infoForm, setInfoForm] = useState({ name: "", rank: "", division: "" });
  const [warningDialog, setWarningDialog] = useState<{ isOpen: boolean; type: WarningInputType | null }>({ isOpen: false, type: null });

  const { data: staff, isLoading } = useGetStaff(staffId, {
    query: { enabled: !!staffId && !isNaN(staffId), queryKey: getGetStaffQueryKey(staffId) }
  });

  const updateStats = useUpdateStats();
  const updateStatus = useUpdateStaffStatus();
  const updateStaff = useUpdateStaff();
  const issueWarning = useIssueWarning();
  const removeWarning = useRemoveWarning();
  const deleteStaff = useDeleteStaff();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!staff) {
    return <div className="p-8 text-muted-foreground font-mono">Staff member not found.</div>;
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'Active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'LOA': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Suspended': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'Terminated': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const refresh = (updated: typeof staff) => {
    queryClient.setQueryData(getGetStaffQueryKey(staffId), updated);
  };

  const errToast = (action: string) =>
    toast({ title: `Failed: ${action}`, description: "Check your connection and try again.", variant: "destructive" });

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: staffId, data: { status: newStatus as any } },
      {
        onSuccess: (data) => { triggerLiveUpdate(); refresh(data); toast({ title: "Status updated", description: `Changed to ${newStatus}` }); },
        onError: () => errToast("Update status"),
      }
    );
  };

  const handleSaveStats = () => {
    updateStats.mutate(
      { id: staffId, data: { period, voiceHours: Number(statsForm.voiceHours), messages: Math.round(Number(statsForm.messages)), eventsHosted: Math.round(Number(statsForm.eventsHosted)), miniEventsHosted: Math.round(Number(statsForm.miniEventsHosted)) } },
      {
        onSuccess: (data) => {
          triggerLiveUpdate();
          refresh(data);
          setIsEditingStats(false);
          toast({ title: "Stats saved", description: `${period === 'weekly' ? 'Weekly' : 'Monthly'} stats updated.` });
        },
        onError: (err: any) => {
          toast({ title: "Failed to save stats", description: err?.message || "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleSaveInfo = () => {
    if (!infoForm.name.trim() || !infoForm.rank.trim()) {
      toast({ title: "Validation error", description: "Name and rank cannot be empty.", variant: "destructive" });
      return;
    }
    updateStaff.mutate(
      { id: staffId, data: { name: infoForm.name.trim(), rank: infoForm.rank.trim(), division: infoForm.division as any } },
      {
        onSuccess: (data) => {
          triggerLiveUpdate();
          refresh(data);
          setIsEditingInfo(false);
          toast({ title: "Profile updated", description: "Name, rank, and division saved." });
        },
        onError: (err: any) => {
          toast({ title: "Failed to update profile", description: err?.message || "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleIssueWarning = (type: WarningInputType) => {
    issueWarning.mutate(
      { id: staffId, data: { type } },
      {
        onSuccess: (data) => {
          triggerLiveUpdate();
          refresh(data);
          setWarningDialog({ isOpen: false, type: null });
          toast({ title: "Warning issued", description: `${type === WarningInputType.written ? 'Written warning' : type === WarningInputType.activityStrike ? 'Activity strike' : 'Final strike'} recorded.`, variant: "destructive" });
        },
        onError: (err: any) => {
          toast({ title: "Failed to issue warning", description: err?.message || "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleRemoveWarning = (type: WarningInputType) => {
    removeWarning.mutate(
      { id: staffId, data: { type } },
      {
        onSuccess: (data) => {
          triggerLiveUpdate();
          refresh(data);
          toast({ title: "Warning removed", description: `${type === WarningInputType.written ? 'Written warning' : type === WarningInputType.activityStrike ? 'Activity strike' : 'Final strike'} removed.` });
        },
        onError: (err: any) => {
          toast({ title: "Failed to remove warning", description: err?.message || "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm(`Permanently remove ${staff.name}? This cannot be undone.`)) return;
    deleteStaff.mutate(
      { id: staffId },
      {
        onSuccess: () => {
          triggerLiveUpdate();
          toast({ title: "Staff removed", description: `${staff.name} has been deleted.` });
          setLocation("/staff");
        },
        onError: (err: any) => {
          toast({ title: "Failed to remove staff", description: err?.message || "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const warningTypeMap: Record<'written' | 'activity' | 'final', WarningInputType> = {
    written: WarningInputType.written,
    activity: WarningInputType.activityStrike,
    final: WarningInputType.finalStrike,
  };

  const WarningBar = ({ count, type, label }: { count: number; type: 'written' | 'activity' | 'final'; label: string }) => {
    const filled = type === 'written' ? 'bg-yellow-500' : type === 'activity' ? 'bg-orange-500' : 'bg-red-500';
    const text = type === 'written' ? 'text-yellow-500' : type === 'activity' ? 'text-orange-500' : 'text-red-500';
    const wType = warningTypeMap[type];
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className={`${text} font-medium uppercase`}>{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold">{count} / 3</span>
            {isAdmin && (
              <div className="flex gap-1">
                <button
                  onClick={() => count > 0 && handleRemoveWarning(wType)}
                  disabled={count === 0 || removeWarning.isPending}
                  className="w-5 h-5 rounded flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border"
                  title={`Remove ${label}`}
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => setWarningDialog({ isOpen: true, type: wType })}
                  disabled={count >= 3 || issueWarning.isPending}
                  className="w-5 h-5 rounded flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border"
                  title={`Add ${label}`}
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 h-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 rounded-sm ${i <= count ? filled : 'bg-secondary'}`} />
          ))}
        </div>
      </div>
    );
  };

  const voiceVal = period === 'weekly' ? staff.weeklyVoiceHours : staff.monthlyVoiceHours;
  const msgsVal = period === 'weekly' ? staff.weeklyMessages : staff.monthlyMessages;
  const eventsVal = period === 'weekly' ? staff.weeklyEventsHosted : staff.monthlyEventsHosted;
  const miniVal = period === 'weekly' ? staff.weeklyMiniEventsHosted : staff.monthlyMiniEventsHosted;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/staff" className="p-2 hover:bg-secondary rounded-full transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          {isEditingInfo ? (
            <div className="space-y-3">
              <Input
                value={infoForm.name}
                onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
                className="text-xl font-bold font-display bg-background"
                placeholder="Full name"
              />
              <div className="flex gap-3">
                <Input
                  value={infoForm.rank}
                  onChange={e => setInfoForm(f => ({ ...f, rank: e.target.value }))}
                  className="font-mono bg-background"
                  placeholder="Rank"
                />
                <Select value={infoForm.division} onValueChange={v => setInfoForm(f => ({ ...f, division: v }))}>
                  <SelectTrigger className="font-mono bg-background w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveInfo} disabled={updateStaff.isPending} className="font-mono text-xs uppercase">
                  <Check className="w-3.5 h-3.5 mr-1" />{updateStaff.isPending ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingInfo(false)} className="font-mono text-xs uppercase">
                  <X className="w-3.5 h-3.5 mr-1" />Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3 flex-wrap">
                {staff.name}
                <span className={`text-xs px-2.5 py-1 rounded font-mono uppercase border ${statusColor(staff.status)}`}>
                  {staff.status}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => { setInfoForm({ name: staff.name, rank: staff.rank, division: staff.division }); setIsEditingInfo(true); }}
                    className="p-1.5 rounded hover:bg-secondary transition-colors"
                    title="Edit name, rank, division"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </h1>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                {staff.rank} · {staff.division} Division · {staff.accessLevel}
              </p>
            </div>
          )}
        </div>
        {isAdmin && !isEditingInfo && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteStaff.isPending} className="font-mono uppercase text-xs flex-shrink-0">
            <Trash2 className="w-4 h-4 mr-2" />{deleteStaff.isPending ? "Removing..." : "Remove"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <Card className="bg-card border-border shadow-sm md:col-span-2">
          <CardHeader className="border-b border-border bg-muted/20 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Stats
            </CardTitle>
            <ToggleGroup type="single" value={period} onValueChange={v => { if (v) { setPeriod(v as any); setIsEditingStats(false); } }} className="bg-background border border-border p-1 rounded-md">
              <ToggleGroupItem value="weekly" className="h-7 px-3 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Weekly</ToggleGroupItem>
              <ToggleGroupItem value="monthly" className="h-7 px-3 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Monthly</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent className="p-6">
            {isEditingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Voice Hours", key: "voiceHours" as const },
                  { label: "Messages", key: "messages" as const },
                  { label: "Events", key: "eventsHosted" as const },
                  { label: "Mini-Events", key: "miniEventsHosted" as const },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs uppercase font-mono text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      min="0"
                      value={statsForm[key]}
                      onChange={e => setStatsForm(s => ({ ...s, [key]: e.target.value === '' ? 0 : Number(e.target.value) }))}
                      className="font-mono bg-background"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Voice Hours", value: `${voiceVal}h` },
                  { label: "Messages", value: msgsVal },
                  { label: "Events", value: eventsVal },
                  { label: "Mini-Events", value: miniVal },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs uppercase font-mono text-muted-foreground mb-1">{label}</div>
                    <div className="text-3xl font-bold font-mono">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {isAdmin && (
              <div className="mt-6 flex justify-end border-t border-border pt-4">
                {isEditingStats ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingStats(false)} className="font-mono uppercase text-xs">Cancel</Button>
                    <Button onClick={handleSaveStats} disabled={updateStats.isPending} className="font-mono uppercase text-xs">
                      {updateStats.isPending ? "Saving..." : "Save Stats"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => {
                    setStatsForm({ voiceHours: voiceVal, messages: msgsVal, eventsHosted: eventsVal, miniEventsHosted: miniVal });
                    setIsEditingStats(true);
                  }} className="font-mono uppercase text-xs">
                    <Pencil className="w-3.5 h-3.5 mr-2" />Edit Stats
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disciplinary */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20 py-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Disciplinary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <WarningBar count={staff.writtenWarnings} type="written" label="Written Warnings" />
            <WarningBar count={staff.activityStrikes} type="activity" label="Activity Strikes" />
            <WarningBar count={staff.finalStrikes} type="final" label="Final Strikes" />

            {isAdmin && (
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">Admin Controls</h3>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Change Status</label>
                  <Select value={staff.status} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
                    <SelectTrigger className="font-mono bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="LOA">LOA</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Issue Warning / Strike</label>
                  <Button variant="outline" className="w-full justify-start text-yellow-500 hover:bg-yellow-500/10 border-yellow-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.written })}>
                    <AlertTriangle className="w-4 h-4 mr-2" />Written Warning
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-orange-500 hover:bg-orange-500/10 border-orange-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.activityStrike })}>
                    <AlertTriangle className="w-4 h-4 mr-2" />Activity Strike
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-500 hover:bg-red-500/10 border-red-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.finalStrike })}>
                    <AlertTriangle className="w-4 h-4 mr-2" />Final Strike
                  </Button>
                </div>
              </div>
            )}

            {!isAdmin && (
              <div className="pt-4 border-t border-border text-center">
                <p className="text-xs font-mono text-muted-foreground">Login as admin to manage warnings & status</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning Dialog */}
      <Dialog open={warningDialog.isOpen} onOpenChange={v => !v && setWarningDialog({ isOpen: false, type: null })}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Confirm Action
            </DialogTitle>
            <DialogDescription className="font-mono text-sm pt-2">
              Issue a <strong>
                {warningDialog.type === WarningInputType.written ? "Written Warning"
                  : warningDialog.type === WarningInputType.activityStrike ? "Activity Strike"
                  : "Final Strike"}
              </strong> to <strong>{staff.name}</strong>? This is permanently recorded.
              {warningDialog.type === WarningInputType.activityStrike && staff.activityStrikes >= 2 && (
                <span className="block mt-2 text-orange-400">Warning: 3 activity strikes = automatic Suspension.</span>
              )}
              {warningDialog.type === WarningInputType.finalStrike && staff.finalStrikes >= 2 && (
                <span className="block mt-2 text-red-400">Warning: 3 final strikes = automatic Termination.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setWarningDialog({ isOpen: false, type: null })} className="font-mono uppercase text-xs">Cancel</Button>
            <Button variant="destructive" onClick={() => warningDialog.type && handleIssueWarning(warningDialog.type)} disabled={issueWarning.isPending} className="font-mono uppercase text-xs">
              {issueWarning.isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
