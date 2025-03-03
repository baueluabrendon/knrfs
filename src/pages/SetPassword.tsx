
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { supabase } from "@/lib/supabase";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get access token from URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    
    // If we have an access token, we're in the verification flow
    if (accessToken) {
      console.log("SetPassword: Access token found, user is verifying email");
    } else {
      console.log("SetPassword: No access token found");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the user's password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (passwordError) throw passwordError;

      // Update the user's profile to mark password as changed
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ is_password_changed: true })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (profileError) {
        console.error("Failed to update profile:", profileError);
      }
      
      toast.success("Password set successfully!");
      
      // Redirect to the appropriate page based on role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (profileData?.role === 'client') {
          navigate('/client');
        } else {
          navigate('/admin');
        }
      } else {
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to set password");
      toast.error(error.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-[400px] bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Set Your Password</h2>
            <p className="text-gray-600 mt-1">Please create a secure password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Setting Password..." : "Set Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
