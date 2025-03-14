
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

interface VerificationEmailFormProps {
  onSuccess: () => void;
}

export const VerificationEmailForm = ({ onSuccess }: VerificationEmailFormProps) => {
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendVerificationEmail } = useAuth();
  
  const handleVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await sendVerificationEmail(verificationEmail);
      onSuccess();
      toast.success("Verification email sent successfully");
    } catch (error) {
      toast.error("Failed to send verification email");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Verification Email"}
        </Button>
      </DialogFooter>
    </form>
  );
};
