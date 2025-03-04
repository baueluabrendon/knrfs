
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendPasswordResetEmail } = useAuth();
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(forgotPasswordEmail);
      onSuccess();
      toast.success("Password reset email sent successfully");
    } catch (error) {
      toast.error("Failed to send password reset email");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Email"}
        </Button>
      </DialogFooter>
    </form>
  );
};
