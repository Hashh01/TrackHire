import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Panel: Hero */}
      <div className="flex-1 relative flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-foreground text-background overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-8 shadow-2xl shadow-primary/50">
            <Briefcase className="h-6 w-6" />
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6">
            Master your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              job search.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 leading-relaxed max-w-md">
            Track applications, organize interviews, and land your dream job with the professional tool built for ambitious candidates.
          </p>
        </div>

        <div className="absolute bottom-8 left-8 text-xs text-gray-500 font-mono">
          © {new Date().getFullYear()} TRACKHIRE INC.
        </div>
      </div>

      {/* Right Panel: Login */}
      <div className="md:w-[480px] flex flex-col justify-center p-8 md:p-12 bg-background border-l border-border relative">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold font-display">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to access your dashboard.</p>
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full h-12 text-base font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all duration-200"
          >
            Log in with Replit
          </Button>

          <div className="pt-8 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <h3 className="font-bold text-2xl text-foreground">100%</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Free for Candidates</p>
              </div>
              <div>
                <h3 className="font-bold text-2xl text-foreground">Secure</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Private Data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
