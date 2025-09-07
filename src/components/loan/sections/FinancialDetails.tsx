import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FinancialDetails = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Financial Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="loanAmount">Loan Amount</Label>
          <Input id="loanAmount" name="loanAmount" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="loanPurpose">Loan Purpose</Label>
          <Input id="loanPurpose" name="loanPurpose" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="loanTerm">Loan Term</Label>
          <Input id="loanTerm" name="loanTerm" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="pvaAmount">PVA Amount</Label>
          <Input id="pvaAmount" name="pvaAmount" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="totalRepayable">Total Repayable</Label>
          <Input id="totalRepayable" name="totalRepayable" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="grossSalary">Gross Salary</Label>
          <Input id="grossSalary" name="grossSalary" readOnly className="bg-white border-gray-300" />
        </div>

        <div>
          <Label htmlFor="netSalary">Net Salary</Label>
          <Input id="netSalary" name="netSalary" readOnly className="bg-white border-gray-300" />
        </div>
      </div>
    </div>
  );
};