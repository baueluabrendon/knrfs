import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const LoginForm = () => {
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Only extract the signIn method, not the user state
  const { signIn } = useAuth(); 
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log("LoginForm: Starting sign in process with:", email);
      const userProfile = await signIn(email, password);
      
      console.log("LoginForm: Sign in successful");
      toast.success("Successfully logged in!");
      
      // Check if this is a first-time login (password not changed)
      if (userProfile && userProfile.is_password_changed === false) {
        console.log("LoginForm: First login detected, redirecting to set-password");
        navigate('/set-password', { replace: true });
      }
      // Otherwise navigation is handled by the AuthForm component or ProtectedRoute
      
    } catch (error: any) {
      console.error("LoginForm: Sign in error:", error);
      
      if (error.message === "Invalid login credentials") {
        setFormError("Invalid email or password");
      } else if (error.message === "User profile not found") {
        setFormError("User profile not found");
      } else {
        setFormError(error.message || "Failed to sign in");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-[400px] bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Login to Your Account</h2>
        <p className="text-gray-600 mt-1">Enter your credentials below</p>
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
          />
        </div>

        {formError && (
          <div className="text-sm text-red-600">
            {formError}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-[#22C55E] hover:bg-[#1EA34D] text-white py-2 rounded-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
        
        <div className="flex justify-end mt-4 text-sm">
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
