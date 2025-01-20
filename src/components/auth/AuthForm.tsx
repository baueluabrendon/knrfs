import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const user = await signIn(email, password);
      if (user && user.role === 'client') {
        navigate('/client');
      } else if (user) {
        navigate('/admin');
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#FFD700] py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Welcome to K&R Financial Services</h1>
        <Button 
          className="bg-[#22C55E] hover:bg-[#1EA34D] text-white rounded-md px-6"
          onClick={() => navigate('/apply')}
        >
          Apply Now
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white">
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

            <Button 
              type="submit" 
              className="w-full bg-[#22C55E] hover:bg-[#1EA34D] text-white py-2 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;