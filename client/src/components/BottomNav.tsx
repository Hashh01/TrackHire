import { Link, useLocation } from "wouter";
import { LayoutDashboard, List, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/applications", icon: List, label: "Applications" },
    { href: "/applications/new", icon: PlusCircle, label: "Add", highlight: true },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden z-50 pb-safe">
      <nav className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
                item.highlight 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 -mt-6 h-14 w-14 rounded-full" 
                  : isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", item.highlight && "h-7 w-7")} />
              {!item.highlight && (
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
