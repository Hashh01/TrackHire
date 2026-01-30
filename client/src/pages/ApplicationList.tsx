import { useApplications } from "@/hooks/use-applications";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "wouter";
import { Search, MapPin, Building2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ApplicationList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  
  const { data: applications, isLoading } = useApplications(
    search, 
    status === "all" ? undefined : status
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Applications</h1>
          <p className="text-muted-foreground mt-1">Manage and track your job opportunities.</p>
        </div>
        <Link href="/applications/new">
          <Button className="shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by role or company..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[180px] bg-card">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interview">Interview</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4"
        >
          {applications?.map((app) => (
            <Link key={app.id} href={`/applications/${app.id}`}>
              <div className="group bg-card hover:bg-accent/5 rounded-xl p-5 border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {app.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{app.role}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> {app.company}
                        </span>
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {app.location}
                          </span>
                        )}
                        {app.jobType && (
                          <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                            {app.jobType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:gap-1">
                    <StatusBadge status={app.status} className="md:order-1 order-2" />
                    <span className="text-xs text-muted-foreground md:order-2 order-1">
                      Applied {app.dateApplied ? format(new Date(app.dateApplied), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {applications?.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No applications found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                Try adjusting your search or filters, or add a new application to get started.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
