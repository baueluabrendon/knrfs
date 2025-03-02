
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Debug log for initial render
  useEffect(() => {
    console.log("LoginForm: Component mounted");
    console.log("LoginForm: Initial user state:", user);
  }, [user]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log("LoginForm: Starting sign in process with:", email);
      const user = await signIn(email, password);
      
      if (!user) {
        throw new Error("Invalid email or password");
      }

      console.log("LoginForm: User signed in successfully:", user);
      console.log("LoginForm: User role:", user.role);
      
      // Route based on user role
      if (user.role === 'client') {
        console.log("LoginForm: Navigating to client dashboard");
        toast.success("Successfully logged in as client!");
        navigate('/client');
      } else {
        console.log("LoginForm: Navigating to admin dashboard with role:", user.role);
        toast.success(`Successfully logged in as ${user.role}!`);
        navigate('/admin');
      }
    } catch (error: any) {
      console.error("LoginForm: Sign in error:", error);
      
      // Display a more user-friendly error message
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

  // Add debug log for when user state changes
  useEffect(() => {
    console.log("LoginForm: User state changed:", user);
    
    if (user) {
      console.log("LoginForm: User is logged in, role:", user.role);
    }
  }, [user]);

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
      </form>
    </div>
  );
};
