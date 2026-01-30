import { useApplication, useUpdateApplication, useDeleteApplication } from "@/hooks/use-applications";
import { useCreateInterview, useDeleteInterview } from "@/hooks/use-interviews";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { 
  Building2, MapPin, Calendar, ExternalLink, 
  Trash2, ArrowLeft, MoreHorizontal, Pencil, Plus 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInterviewSchema } from "@shared/schema";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ApplicationDetail() {
  const [, params] = useRoute("/applications/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: app, isLoading } = useApplication(id);
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();
  const createInterviewMutation = useCreateInterview();
  const deleteInterviewMutation = useDeleteInterview();

  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);

  // Status Change Handler
  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast({ title: "Status updated", description: `Application moved to ${newStatus}` });
        }
      }
    );
  };

  // Delete Handler
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this application? This cannot be undone.")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({ title: "Application deleted" });
          setLocation("/applications");
        }
      });
    }
  };

  // Interview Form
  const formSchema = insertInterviewSchema.omit({ applicationId: true }).extend({
    date: z.string(), // Handle date as string for input, then convert
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Phone",
      location: "",
      notes: "",
      date: new Date().toISOString().slice(0, 16), // current datetime-local
    },
  });

  const onInterviewSubmit = (data: z.infer<typeof formSchema>) => {
    createInterviewMutation.mutate(
      {
        ...data,
        date: new Date(data.date),
        applicationId: id,
      },
      {
        onSuccess: () => {
          setInterviewDialogOpen(false);
          form.reset();
          toast({ title: "Interview scheduled" });
        },
      }
    );
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full rounded-2xl" /></div>;
  if (!app) return <div className="p-8">Application not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="w-fit -ml-2 text-muted-foreground" onClick={() => setLocation("/applications")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
              {app.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">{app.role}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground font-medium">
                <Building2 className="h-4 w-4" /> {app.company}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={app.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] h-10 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation(`/applications/${id}/edit`)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Location</Label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {app.location || "Remote"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Applied On</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> 
                    {app.dateApplied ? format(new Date(app.dateApplied), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Job Type</Label>
                  <p className="font-medium">{app.jobType || "Full-time"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Salary Range</Label>
                  <p className="font-medium">
                    {app.salaryMin ? `$${app.salaryMin.toLocaleString()}` : ''} 
                    {app.salaryMax ? ` - $${app.salaryMax.toLocaleString()}` : ''}
                    {!app.salaryMin && !app.salaryMax && "Not specified"}
                  </p>
                </div>
              </div>

              {app.link && (
                <div className="pt-2">
                  <a href={app.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" /> View Job Posting
                    </Button>
                  </a>
                </div>
              )}

              {app.description && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Description</Label>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{app.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {app.notes || "No notes added yet."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Interviews */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Interviews</CardTitle>
              <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onInterviewSubmit)} className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Phone">Phone Screen</SelectItem>
                                <SelectItem value="Video">Video Call</SelectItem>
                                <SelectItem value="Onsite">Onsite</SelectItem>
                                <SelectItem value="Technical">Technical</SelectItem>
                                <SelectItem value="Behavioral">Behavioral</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date & Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link / Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Zoom link or address" {...field} />
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Interviewer names, topics to prepare..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={createInterviewMutation.isPending}>
                        {createInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative pl-4 border-l-2 border-muted ml-2">
                {app.interviews?.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-2 italic">No interviews scheduled.</p>
                ) : (
                  app.interviews?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((interview) => (
                    <div key={interview.id} className="relative pl-6 group">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background ring-1 ring-primary/20" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{interview.type}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(interview.date), 'MMM d, h:mm a')}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if(confirm("Delete this interview?")) {
                              deleteInterviewMutation.mutate({ id: interview.id, applicationId: id });
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {interview.notes && (
                        <p className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                          {interview.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
