import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthFormProps {
  defaultTab?: "sign-in" | "sign-up";
}

const AuthForm = ({ defaultTab = "sign-in" }: AuthFormProps) => {
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
      if (user && user.role === 'CLIENT') {
        navigate('/client');
      } else if (user) {
        navigate('/');
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px] bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary rounded-full p-1">
            <TabsTrigger 
              value="sign-in"
              className="rounded-full data-[state=active]:bg-white"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="sign-up"
              className="rounded-full data-[state=active]:bg-white"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 bg-secondary/50 border-0 rounded-full px-6"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-12 bg-secondary/50 border-0 rounded-full px-6"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;