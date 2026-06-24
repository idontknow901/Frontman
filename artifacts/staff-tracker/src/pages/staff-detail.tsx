import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetStaff, getGetStaffQueryKey, useUpdateStats, useUpdateStaffStatus,
  useIssueWarning, useDeleteStaff, useUpdateStaff, WarningInputType
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
import { AlertTriangle, Trash2, ShieldAlert, Activity, ArrowLeft, Pencil, Check, X } from "lucide-react";
import { Link } from "wouter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

  const { data: staff, isLoading } = useGetStaff(staffId, { query: { enabled: !!staffId, queryKey: getGetStaffQueryKey(staffId) } });
  const updateStats = useUpdateStats();
  const updateStatus = useUpdateStaffStatus();
  const updateStaff = useUpdateStaff();
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
    switch (s) {
      case 'Active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'LOA': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Suspended': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'Terminated': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetStaffQueryKey(staffId) });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id: staffId, data: { status: newStatus as any } }, {
      onSuccess: () => {
        invalidate();
        toast({ title: "Status Updated", description: `Status changed to ${newStatus}` });
      }
    });
  };

  const handleSaveStats = () => {
    updateStats.mutate({ id: staffId, data: { period, ...statsForm } }, {
      onSuccess: () => {
        invalidate();
        setIsEditingStats(false);
        toast({ title: "Stats Updated", description: `${period} stats saved.` });
      }
    });
  };

  const handleSaveInfo = () => {
    updateStaff.mutate({ id: staffId, data: { name: infoForm.name, rank: infoForm.rank, division: infoForm.division as any } }, {
      onSuccess: () => {
        invalidate();
        setIsEditingInfo(false);
        toast({ title: "Profile Updated", description: "Staff info saved." });
      }
    });
  };

  const handleIssueWarning = (type: WarningInputType) => {
    issueWarning.mutate({ id: staffId, data: { type, note: "Admin issued via dashboard" } }, {
      onSuccess: () => {
        invalidate();
        setWarningDialog({ isOpen: false, type: null });
        toast({ title: "Warning Issued", description: `${type} recorded.`, variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete ${staff.name}? This cannot be undone.`)) {
      deleteStaff.mutate({ id: staffId }, {
        onSuccess: () => {
          toast({ title: "Staff Removed", description: "Record deleted." });
          setLocation("/staff");
        }
      });
    }
  };

  const WarningBar = ({ count, type, label }: { count: number, type: 'written' | 'activity' | 'final', label: string }) => {
    const color = type === 'written' ? 'bg-yellow-500' : type === 'activity' ? 'bg-orange-500' : 'bg-red-500';
    const textColor = type === 'written' ? 'text-yellow-500' : type === 'activity' ? 'text-orange-500' : 'text-red-500';
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono uppercase">
          <span className={`${textColor} font-medium`}>{label}</span>
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
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/staff" className="p-2 hover:bg-secondary rounded-full transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          {isEditingInfo ? (
            <div className="space-y-3">
              <Input
                value={infoForm.name}
                onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
                className="text-2xl font-bold font-display bg-background h-12"
                placeholder="Name"
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
                  <Check className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingInfo(false)} className="font-mono text-xs uppercase">
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3 flex-wrap">
                {staff.name}
                <span className={`text-xs px-2.5 py-1 rounded font-mono uppercase border ${getStatusColor(staff.status)}`}>
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
                {staff.rank} • {staff.division} Division • Level: {staff.accessLevel}
              </p>
            </div>
          )}
        </div>
        {isAdmin && !isEditingInfo && (
          <Button variant="destructive" size="sm" onClick={handleDelete} className="font-mono uppercase text-xs flex-shrink-0">
            <Trash2 className="w-4 h-4 mr-2" /> Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card */}
        <Card className="bg-card border-border shadow-sm md:col-span-2">
          <CardHeader className="border-b border-border bg-muted/20 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Stats
            </CardTitle>
            <ToggleGroup type="single" value={period} onValueChange={(v) => { if (v) { setPeriod(v as any); setIsEditingStats(false); } }} className="bg-background border border-border p-1 rounded-md">
              <ToggleGroupItem value="weekly" className="h-7 px-3 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Weekly</ToggleGroupItem>
              <ToggleGroupItem value="monthly" className="h-7 px-3 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Monthly</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent className="p-6">
            {!isEditingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Voice Hours", value: `${period === 'weekly' ? staff.weeklyVoiceHours : staff.monthlyVoiceHours}h` },
                  { label: "Messages", value: period === 'weekly' ? staff.weeklyMessages : staff.monthlyMessages },
                  { label: "Events", value: period === 'weekly' ? staff.weeklyEventsHosted : staff.monthlyEventsHosted },
                  { label: "Mini-Events", value: period === 'weekly' ? staff.weeklyMiniEventsHosted : staff.monthlyMiniEventsHosted },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs uppercase font-mono text-muted-foreground mb-1">{label}</div>
                    <div className="text-3xl font-bold font-mono">{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Voice Hours", key: "voiceHours" as const, type: "number" },
                  { label: "Messages", key: "messages" as const, type: "number" },
                  { label: "Events", key: "eventsHosted" as const, type: "number" },
                  { label: "Mini-Events", key: "miniEventsHosted" as const, type: "number" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs uppercase font-mono text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      value={statsForm[key]}
                      onChange={e => setStatsForm(s => ({ ...s, [key]: +e.target.value }))}
                      className="font-mono bg-background"
                    />
                  </div>
                ))}
              </div>
            )}

            {isAdmin && (
              <div className="mt-6 flex justify-end border-t border-border pt-4">
                {isEditingStats ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingStats(false)} className="font-mono uppercase text-xs">Cancel</Button>
                    <Button onClick={handleSaveStats} className="font-mono uppercase text-xs" disabled={updateStats.isPending}>
                      {updateStats.isPending ? "Saving..." : "Save Stats"}
                    </Button>
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
                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Stats
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disciplinary Card */}
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
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Admin Controls</h3>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Change Status</label>
                  <Select value={staff.status} onValueChange={handleStatusChange}>
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
                  <Button variant="outline" className="w-full justify-start text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500 border-yellow-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.written })}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Written Warning
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-orange-500 hover:bg-orange-500/10 hover:text-orange-500 border-orange-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.activityStrike })}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Activity Strike
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500 border-red-500/20 font-mono text-xs uppercase" onClick={() => setWarningDialog({ isOpen: true, type: WarningInputType.finalStrike })}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Final Strike
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning Confirmation Dialog */}
      <Dialog open={warningDialog.isOpen} onOpenChange={(v) => !v && setWarningDialog({ isOpen: false, type: null })}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Confirm Action
            </DialogTitle>
            <DialogDescription className="font-mono text-sm pt-2">
              Issue a <strong>{warningDialog.type === WarningInputType.written ? "Written Warning" : warningDialog.type === WarningInputType.activityStrike ? "Activity Strike" : "Final Strike"}</strong> to <strong>{staff.name}</strong>?
              This will be permanently recorded.
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
