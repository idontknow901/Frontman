import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useCreateStaff, StaffInputDivision, StaffInputAccessLevel } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rank: z.string().min(1, "Rank is required"),
  division: z.nativeEnum(StaffInputDivision),
  accessLevel: z.nativeEnum(StaffInputAccessLevel),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddStaff() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const createStaff = useCreateStaff();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rank: "",
      division: StaffInputDivision.Event,
      accessLevel: StaffInputAccessLevel.Staff,
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    createStaff.mutate({ data: values }, {
      onSuccess: (newStaff) => {
        toast({ title: "Staff Added", description: `${newStaff.name} has been added.` });
        setLocation("/staff");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add staff member.", variant: "destructive" });
      }
    });
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-24 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 border border-border flex items-center justify-center">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold">Admin Access Required</h2>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            Log in as admin from the sidebar to add new staff members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Add Staff Member</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Register a new staff member to the system</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              New Staff Record
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name..." className="font-mono bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Rank</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Mod" className="font-mono bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Division</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono bg-background">
                              <SelectValue placeholder="Select division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={StaffInputDivision.Event}>Event</SelectItem>
                            <SelectItem value={StaffInputDivision.Training}>Training</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Access Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono bg-background">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={StaffInputAccessLevel.Staff}>Staff</SelectItem>
                            <SelectItem value={StaffInputAccessLevel.Assistant_Director}>Assistant Director</SelectItem>
                            <SelectItem value={StaffInputAccessLevel.Director}>Director</SelectItem>
                            <SelectItem value={StaffInputAccessLevel.HQ}>HQ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-wider text-xs font-mono">Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any notes about this staff member..."
                          className="min-h-[100px] font-mono bg-background resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    type="submit"
                    disabled={createStaff.isPending}
                    className="font-mono uppercase tracking-widest font-bold"
                  >
                    {createStaff.isPending ? "Saving..." : "Add Staff Member"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
