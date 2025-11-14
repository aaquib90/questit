import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogIn, LogOut, User, Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface User {
  email: string;
  id: string;
}

interface AuthButtonProps {
  user: User | null;
  onSignIn: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AuthButton({ user, onSignIn, onSignOut }: AuthButtonProps) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await onSignIn(email);
      toast.success("Check your email for a magic link!");
      setShowSignIn(false);
      setEmail("");
    } catch (error) {
      toast.error("Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (user) {
    const initials = user.email
      .split("@")[0]
      .split(/[^a-zA-Z]/)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p>Signed in as</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setShowSignIn(true)}>
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>

      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign In to Questit</DialogTitle>
            <DialogDescription>
              Enter your email to receive a magic link. No password required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignIn} className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                We'll send you a secure magic link to sign in. No password needed, no PII stored.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={!email.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
