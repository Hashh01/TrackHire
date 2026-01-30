import { useStats } from "@/hooks/use-stats";
import { useApplications } from "@/hooks/use-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Briefcase, CheckCircle2, XCircle, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentApps, isLoading: appsLoading } = useApplications(undefined, undefined);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (statsLoading || appsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-display font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your job search.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium text-sm">Total Applied</p>
                  <h3 className="text-3xl font-bold mt-2">{stats?.total || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground font-medium text-sm">Interviews</p>
                  <h3 className="text-3xl font-bold mt-2 text-purple-600">{stats?.interviewing || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground font-medium text-sm">Offers</p>
                  <h3 className="text-3xl font-bold mt-2 text-green-600">{stats?.offered || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground font-medium text-sm">Rejected</p>
                  <h3 className="text-3xl font-bold mt-2 text-red-600">{stats?.rejected || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display">Recent Applications</h2>
          <Link href="/applications" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentApps?.slice(0, 5).map((app) => (
            <Link key={app.id} href={`/applications/${app.id}`}>
              <div className="bg-card rounded-xl p-4 border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{app.role}</h3>
                    <p className="text-sm text-muted-foreground">{app.company} • {app.location || "Remote"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-muted-foreground">
                      {app.dateApplied ? format(new Date(app.dateApplied), 'MMM d') : 'No date'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {recentApps?.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground mb-4">No applications yet</p>
              <Link href="/applications/new">
                <span className="text-primary font-medium hover:underline cursor-pointer">Start tracking your first job application</span>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
