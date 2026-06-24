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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";

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
        toast({ title: "Personnel Added", description: `${newStaff.name} has been added to the registry.` });
        setLocation("/staff");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add personnel.", variant: "destructive" });
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Onboard Personnel</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Register a new staff member to the command system</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              New Identity Record
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
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Designation / Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name..." className="font-mono bg-background" {...field} />
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
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Rank Classification</FormLabel>
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
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Division Assigment</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono bg-background">
                              <SelectValue placeholder="Select division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={StaffInputDivision.Event}>Event Operations</SelectItem>
                            <SelectItem value={StaffInputDivision.Training}>Training Command</SelectItem>
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
                        <FormLabel className="uppercase tracking-wider text-xs font-mono">Clearance Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono bg-background">
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={StaffInputAccessLevel.Staff}>Staff (Level 1)</SelectItem>
                            <SelectItem value={StaffInputAccessLevel.Assistant_Director}>Assistant Director (Level 2)</SelectItem>
                            <SelectItem value={StaffInputAccessLevel.Director}>Director (Level 3)</SelectItem>
                            <SelectItem value={StaffInputAccessLevel.HQ}>HQ Command (Level 4)</SelectItem>
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
                      <FormLabel className="uppercase tracking-wider text-xs font-mono">Initial Dossier Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Optional notes regarding this operative..." 
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
                    {createStaff.isPending ? "Transmitting..." : "Initialize Record"}
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
