
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { VerificationEmailForm } from "./VerificationEmailForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);
  const { signIn } = useAuth();
  const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log("LoginForm: Starting sign in process with:", email);
      await signIn(email, password);
      
      console.log("LoginForm: Sign in successful");
      toast.success("Successfully logged in!");
      
      // Auth redirects are handled by AuthForm.tsx 
      // No need to navigate here (removed the redundant navigate calls)
      
    } catch (error: any) {
      console.error("LoginForm: Sign in error:", error);
      
      if (error.code === "invalid_credentials") {
        setError("Invalid email or password");
        toast.error("Invalid email or password");
      } else {
        setError(error.message || "Failed to sign in");
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-[400px] bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Login to Your Account</h2>
        <p className="text-gray-600 mt-1">Enter your credentials below</p>
        {isDevelopment && (
          <p className="text-green-600 mt-1">Development Mode: Auto-login available</p>
        )}
      </div>

      <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            defaultValue={isDevelopment ? "admin@example.com" : ""}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            defaultValue={isDevelopment ? "password123" : ""}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-[#22C55E] hover:bg-[#1EA34D] text-white py-2 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>
        
        <div className="flex justify-between mt-4 text-sm">
          <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-[#22C55E] hover:underline">
                Need Verification Email?
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Verification Email</DialogTitle>
              </DialogHeader>
              <VerificationEmailForm onSuccess={() => setIsVerificationDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isForgotPasswordDialogOpen} onOpenChange={setIsForgotPasswordDialogOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-[#22C55E] hover:underline">
                Forgot Password?
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Your Password</DialogTitle>
              </DialogHeader>
              <ForgotPasswordForm onSuccess={() => setIsForgotPasswordDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  );
};
