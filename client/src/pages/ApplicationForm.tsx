import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertApplicationSchema } from "@shared/schema";
import { useCreateApplication, useUpdateApplication, useApplication } from "@/hooks/use-applications";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Allow empty strings in form but handle coercion
const formSchema = insertApplicationSchema.extend({
  dateApplied: z.string().optional(),
  salaryMin: z.union([z.string(), z.number()]).transform(val => val === "" ? undefined : Number(val)),
  salaryMax: z.union([z.string(), z.number()]).transform(val => val === "" ? undefined : Number(val)),
});

export default function ApplicationForm() {
  const [, params] = useRoute("/applications/:id/edit");
  const isEdit = !!params?.id;
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: existingApp, isLoading: isLoadingApp } = useApplication(id);
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Applied",
      jobType: "Full-time",
      dateApplied: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (existingApp) {
      form.reset({
        ...existingApp,
        dateApplied: existingApp.dateApplied ? new Date(existingApp.dateApplied).toISOString().slice(0, 10) : undefined,
        salaryMin: existingApp.salaryMin ?? "",
        salaryMax: existingApp.salaryMax ?? "",
        description: existingApp.description || "",
        notes: existingApp.notes || "",
        link: existingApp.link || "",
        location: existingApp.location || "",
      });
    }
  }, [existingApp, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const formattedData = {
      ...data,
      dateApplied: data.dateApplied ? new Date(data.dateApplied) : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id, ...formattedData },
        {
          onSuccess: () => {
            toast({ title: "Application updated" });
            setLocation(`/applications/${id}`);
          }
        }
      );
    } else {
      createMutation.mutate(formattedData, {
        onSuccess: (newApp) => {
          toast({ title: "Application created" });
          setLocation(`/applications/${newApp.id}`);
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingApp) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation(isEdit ? `/applications/${id}` : "/applications")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display">{isEdit ? "Edit Application" : "New Application"}</h1>
          <p className="text-muted-foreground text-sm">Track details about this opportunity.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Interview">Interview</SelectItem>
                          <SelectItem value="Offer">Offer</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "Full-time"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Full-time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateApplied"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Date Applied</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, NY or Remote" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Min</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="80000" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Max</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="120000" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Paste job description here..." 
                        className="min-h-[120px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>My Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Private notes about this application..." 
                        className="min-h-[100px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation(isEdit ? `/applications/${id}` : "/applications")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  {isEdit ? "Update Application" : "Create Application"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
