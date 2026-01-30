import { Link, useLocation } from "wouter";
import { LayoutDashboard, List, PlusCircle, User, LogOut, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function DesktopSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/applications", icon: List, label: "Applications" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-card min-h-screen sticky top-0 h-screen">
      <div className="p-6 border-b flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Briefcase className="h-5 w-5" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">TrackHire</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        <div className="mb-8">
          <Link href="/applications/new">
            <Button className="w-full gap-2 shadow-lg shadow-primary/20" size="lg">
              <PlusCircle className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>

        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
