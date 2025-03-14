
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface VerificationEmailFormProps {
  onSuccess: () => void;
}

export const VerificationEmailForm = ({ onSuccess }: VerificationEmailFormProps) => {
  const [verificationEmail, setVerificationEmail] = useState("");
  
  return (
    <div className="space-y-4 mt-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Email Verification Disabled</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Email verification has been disabled. New users are created with default credentials.
            Please contact an administrator if you need account assistance.
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button">Close</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};
