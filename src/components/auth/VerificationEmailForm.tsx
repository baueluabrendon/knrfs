
import { useState } from "react";
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
  
  const handleVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This feature has been disabled
    toast.info("Email verification has been disabled. Please contact an administrator to create your account.");
    onSuccess();
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
      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
        <p>Email verification has been disabled. Please contact an administrator to create your account.</p>
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
