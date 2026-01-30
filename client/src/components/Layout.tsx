import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  // If not authenticated, we don't render the app layout (login page handles itself)
  if (!isAuthenticated) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <ScrollArea className="h-[calc(100vh-5rem)] md:h-screen">
          <div className="container max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {children}
          </div>
        </ScrollArea>
      </main>
      <BottomNav />
    </div>
  );
}
