
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { UserProfile } from "@/types/auth";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, updateUserProfile } = useAuth();

  // Redirect if user already has password set
  useEffect(() => {
    if (!loading && user?.is_password_changed) {
      console.log("SetPassword: User already has password set, redirecting");
      const redirectPath = user.role === "client" ? "/client" : "/admin";
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate]);

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
      // 1. Update the user's password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (passwordError) throw passwordError;

      console.log("Password updated successfully");

      // 2. Get current user to ensure we have the latest session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error("User session not found after password update");
      }

      console.log("Current user found:", currentUser.id);
      
      // 3. Update the user's profile to mark password as changed
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ is_password_changed: true })
        .eq('user_id', currentUser.id);
      
      if (profileError) {
        console.error("Failed to update profile:", profileError);
        throw profileError;
      }

      console.log("Profile updated: is_password_changed set to true");
      
      // 4. Fetch the updated profile data
      const { data: profileData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('role, is_password_changed, user_id, email, first_name, last_name')
        .eq('user_id', currentUser.id)
        .single();
        
      if (fetchError || !profileData) {
        console.error("Failed to fetch updated profile:", fetchError);
        throw fetchError || new Error("Profile data not found");
      }

      console.log("Fetched updated profile:", profileData);
      
      // 5. Update the auth context with the latest user data
      // Explicitly cast the role to ensure type compatibility
      const roleValue = profileData.role as UserProfile["role"];
      
      updateUserProfile({
        is_password_changed: true,
        role: roleValue
      });
      
      toast.success("Password set successfully!");
      
      // 6. Redirect to the appropriate page based on role
      const redirectPath = roleValue === 'client' ? '/client' : '/admin';
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to set password");
      toast.error(error.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
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
