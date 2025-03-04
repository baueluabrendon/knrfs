import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);
  const { signIn, sendVerificationEmail, sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
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
      const userData = await signIn(email, password);
      
      console.log("LoginForm: Sign in successful, user data:", userData);
      toast.success("Successfully logged in!");
      
      if (userData) {
        console.log("LoginForm: Redirecting based on role:", userData.role);
        if (userData.role === 'client') {
          navigate('/client', { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      }
    } catch (error: any) {
      console.error("LoginForm: Sign in error:", error);
      
      if (error.code === "invalid_credentials") {
        setError("Invalid email or password");
        toast.error("Invalid email or password");
      } else {
        setError(error.message || "Failed to sign in");
        toast.error(error.message || "Failed to sign in");
      }
      
      if (isDevelopment) {
        console.log("LoginForm: Development mode - redirecting to admin despite error");
        navigate('/admin', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    try {
      await sendVerificationEmail(verificationEmail);
      setIsVerificationDialogOpen(false);
      toast.success("Verification email sent successfully");
    } catch (error) {
      toast.error("Failed to send verification email");
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    try {
      await sendPasswordResetEmail(forgotPasswordEmail);
      setIsForgotPasswordDialogOpen(false);
      toast.success("Password reset email sent successfully");
    } catch (error) {
      toast.error("Failed to send password reset email");
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
        
        {isDevelopment && (
          <Button 
            type="button" 
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2 rounded-md mt-2"
            onClick={() => navigate('/admin', { replace: true })}
          >
            Dev Mode: Go to Admin Dashboard
          </Button>
        )}
        
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
              <form onSubmit={handleVerificationRequest} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="verification-email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <Input 
                    id="verification-email" 
                    type="email" 
                    value={verificationEmail}
                    onChange={(e) => setVerificationEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    required 
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Send Verification Email</Button>
                </DialogFooter>
              </form>
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
              <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="forgot-password-email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <Input 
                    id="forgot-password-email" 
                    type="email" 
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    required 
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Send Reset Email</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  );
};
