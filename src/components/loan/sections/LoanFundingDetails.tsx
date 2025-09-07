import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoanFundingDetails = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Loan Funding Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="bank">Bank</Label>
          <Input id="bank" name="bank" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="bankBranch">Bank Branch</Label>
          <Input id="bankBranch" name="bankBranch" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="bsbCode">BSB Code</Label>
          <Input id="bsbCode" name="bsbCode" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="accountName">Account Name</Label>
          <Input id="accountName" name="accountName" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input id="accountNumber" name="accountNumber" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="accountType">Account Type</Label>
          <Input id="accountType" name="accountType" readOnly className="bg-white border-gray-300" />
        </div>
      </div>
    </div>
  );
};