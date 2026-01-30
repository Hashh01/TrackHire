import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-lg mx-auto mt-8 md:mt-20">
      <Card className="border-none shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-blue-300 p-1 mb-4 shadow-xl">
            <Avatar className="h-full w-full border-4 border-background">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="text-2xl font-bold bg-muted text-foreground">
                {user?.firstName?.charAt(0) || <User />}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-display">
            {user?.firstName} {user?.lastName}
          </CardTitle>
          <p className="text-muted-foreground">{user?.email}</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs truncate max-w-[150px]">{user?.id}</span>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            className="w-full gap-2 shadow-lg shadow-destructive/20 hover:shadow-destructive/40" 
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
