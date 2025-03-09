
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";
import { formatAmount } from "../utils";

interface LoanInfoSectionProps {
  application: LoanApplicationType;
}

const LoanInfoSection = ({ application }: LoanInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Amount",
      value: formatAmount(application)
    },
    {
      label: "Purpose",
      value: application.jsonb_data?.financialDetails?.loanPurpose || ''
    },
    {
      label: "Term",
      value: application.jsonb_data?.financialDetails?.loanTerm || ''
    },
    {
      label: "Bi-weekly Payment",
      value: application.jsonb_data?.financialDetails?.fortnightlyInstallment
        ? `$${application.jsonb_data?.financialDetails?.fortnightlyInstallment}`
        : ''
    },
    {
      label: "Gross Loan",
      value: application.jsonb_data?.financialDetails?.grossLoan
        ? `$${application.jsonb_data?.financialDetails?.grossLoan}`
        : ''
    }
  ];

  return <ApplicationSection title="Loan Information" fields={fields} />;
};

export default LoanInfoSection;
