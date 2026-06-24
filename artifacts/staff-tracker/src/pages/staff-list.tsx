import { useState } from "react";
import { useListStaff, ListStaffDivision, ListStaffStatus } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence } from "framer-motion";
import { Search, ChevronRight, FilterX } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function StaffList() {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState<ListStaffDivision | "ALL">("ALL");
  const [status, setStatus] = useState<ListStaffStatus | "ALL">("ALL");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  const queryParams = {
    ...(division !== "ALL" && { division }),
    ...(status !== "ALL" && { status }),
  };

  const { data: staffList, isLoading, isError } = useListStaff(queryParams);

  const filteredStaff = (staffList || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rank.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'LOA': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Suspended': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'Terminated': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const WarningPips = ({ count, type }: { count: number, type: 'written' | 'activity' | 'final' }) => {
    const color = type === 'written' ? 'bg-yellow-500' : type === 'activity' ? 'bg-orange-500' : 'bg-red-500';
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full ${i <= count ? color : 'bg-border'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Personnel Roster</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">Directory of all tracked operatives</p>
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={period} onValueChange={(v) => v && setPeriod(v as "weekly" | "monthly")} className="bg-card border border-border p-1 rounded-md">
            <ToggleGroupItem value="weekly" className="h-8 px-4 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Weekly</ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="h-8 px-4 font-mono text-xs uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Monthly</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="p-4 bg-card border border-border rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Name or rank..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 font-mono bg-background"
            />
          </div>
        </div>
        <div className="w-full md:w-48 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Division</label>
          <Select value={division} onValueChange={(v: any) => setDivision(v)}>
            <SelectTrigger className="font-mono bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Divisions</SelectItem>
              <SelectItem value={ListStaffDivision.Event}>Event</SelectItem>
              <SelectItem value={ListStaffDivision.Training}>Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</label>
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="font-mono bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={ListStaffStatus.Active}>Active</SelectItem>
              <SelectItem value={ListStaffStatus.LOA}>LOA</SelectItem>
              <SelectItem value={ListStaffStatus.Suspended}>Suspended</SelectItem>
              <SelectItem value={ListStaffStatus.Terminated}>Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="h-10 px-3 w-full md:w-auto"
          onClick={() => { setSearch(""); setDivision("ALL"); setStatus("ALL"); }}
        >
          <FilterX className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline font-mono text-xs uppercase">Reset</span>
        </Button>
      </div>

      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden shadow-sm flex flex-col">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
            Connection failed. Retrying...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-16 border-dashed border-2 border-border m-4 rounded-lg">
            <Search className="w-8 h-8 mb-4 opacity-50" />
            <p className="font-mono uppercase tracking-wider text-sm">No records match parameters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10">Name</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10">Division</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10">Status</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-right">Voice Hrs</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-right">Messages</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-right">Events</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-right">Mini-Events</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider h-10">Warnings</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredStaff.map((staff) => (
                    <TableRow
                      key={staff.id}
                      className="group cursor-pointer hover:bg-secondary/40 transition-colors"
                    >
                      <TableCell>
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{staff.rank}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-secondary border border-border">
                          {staff.division}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${getStatusColor(staff.status)}`}>
                          {staff.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {period === 'weekly' ? staff.weeklyVoiceHours : staff.monthlyVoiceHours}h
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {period === 'weekly' ? staff.weeklyMessages : staff.monthlyMessages}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {period === 'weekly' ? staff.weeklyEventsHosted : staff.monthlyEventsHosted}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {period === 'weekly' ? staff.weeklyMiniEventsHosted : staff.monthlyMiniEventsHosted}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-yellow-500/70 uppercase w-12">Written</span>
                            <WarningPips count={staff.writtenWarnings} type="written" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-orange-500/70 uppercase w-12">Activity</span>
                            <WarningPips count={staff.activityStrikes} type="activity" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-red-500/70 uppercase w-12">Final</span>
                            <WarningPips count={staff.finalStrikes} type="final" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/staff/${staff.id}`} className="block">
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
