
import { LoanApplicationType } from "@/types/loan";
import { formatAmount } from "../utils";

interface LoanInfoSectionProps {
  application: LoanApplicationType;
}

const LoanInfoSection = ({ application }: LoanInfoSectionProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Loan Information</h3>
      <div className="grid grid-cols-2 gap-2">
        <p><span className="font-medium">Amount:</span> {formatAmount(application)}</p>
        <p><span className="font-medium">Purpose:</span> {application.jsonb_data?.financialDetails?.loanPurpose}</p>
        <p><span className="font-medium">Term:</span> {application.jsonb_data?.financialDetails?.loanTerm}</p>
        <p><span className="font-medium">Bi-weekly Payment:</span> ${application.jsonb_data?.financialDetails?.fortnightlyInstallment}</p>
        <p><span className="font-medium">Gross Loan:</span> ${application.jsonb_data?.financialDetails?.grossLoan}</p>
      </div>
    </div>
  );
};

export default LoanInfoSection;
