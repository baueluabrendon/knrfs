import React, { useEffect, useState } from "react";
import { getActiveBranches, Branch } from "@/lib/api/branches";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

interface BranchSelectorProps {
  selectedBranchId: string;
  onBranchSelect: (branchId: string) => void;
  disabled?: boolean;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  selectedBranchId,
  onBranchSelect,
  disabled = false
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const activeBranches = await getActiveBranches();
        setBranches(activeBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Failed to load branches");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const selectedBranch = branches.find(branch => branch.id === selectedBranchId);

  return (
    <div className="space-y-2">
      <Label htmlFor="branch-select" className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Application Branch *
      </Label>
      
      <Select 
        value={selectedBranchId} 
        onValueChange={onBranchSelect}
        disabled={disabled || loading}
      >
        <SelectTrigger id="branch-select" className="w-full">
          <SelectValue placeholder={loading ? "Loading branches..." : "Select a branch"}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading branches...
              </div>
            ) : (
              selectedBranch && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedBranch.branch_code}</span>
                  <span>-</span>
                  <span>{selectedBranch.branch_name}</span>
                </div>
              )
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary">{branch.branch_code}</span>
                <span>-</span>
                <span>{branch.branch_name}</span>
                {branch.city && (
                  <span className="text-muted-foreground">({branch.city})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedBranch && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-start gap-2 mt-2">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {selectedBranch.address_line1 && (
                <div>{selectedBranch.address_line1}</div>
              )}
              {selectedBranch.address_line2 && (
                <div>{selectedBranch.address_line2}</div>
              )}
              {(selectedBranch.city || selectedBranch.state_province) && (
                <div>
                  {selectedBranch.city}{selectedBranch.city && selectedBranch.state_province && ', '}
                  {selectedBranch.state_province}
                </div>
              )}
              {selectedBranch.phone_number && (
                <div className="font-medium">📞 {selectedBranch.phone_number}</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Select the branch where you are submitting this application. This helps us identify and process your application correctly.
      </p>
    </div>
  );
};