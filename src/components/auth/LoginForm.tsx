import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log("Starting sign in process..."); // Debug log
      console.log("Attempting to sign in with email:", email);
      
      const user = await signIn(email, password);
      console.log("Sign in response:", user); // Debug log
      
      if (!user) {
        throw new Error("No user data returned from sign in");
      }

      console.log("User role:", user.role); // Debug log
      
      if (user.role === 'client') {
        navigate('/client');
      } else if (user.role === 'super user' || user.role === 'administrator') {
        navigate('/admin');
      } else {
        // For other roles, still navigate to admin
        navigate('/admin');
      }
    } catch (error: any) {
      console.error("Sign in error details:", error);
      let errorMessage = "Failed to sign in. Please check your credentials.";
      
      if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before logging in.";
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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