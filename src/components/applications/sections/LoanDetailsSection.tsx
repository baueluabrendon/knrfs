
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";
import { formatAmount } from "../utils";

interface LoanDetailsSectionProps {
  application: LoanApplicationType;
}

const LoanDetailsSection = ({ application }: LoanDetailsSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Purpose of Loan",
      value: application.jsonb_data?.financialDetails?.loanPurpose || ''
    },
    {
      label: "Loan Amount",
      value: formatAmount(application)
    },
    {
      label: "Loan Term",
      value: application.jsonb_data?.financialDetails?.loanTerm || ''
    },
    {
      label: "Bi-Weekly Installment",
      value: application.jsonb_data?.financialDetails?.fortnightlyInstallment
        ? `$${application.jsonb_data?.financialDetails?.fortnightlyInstallment}`
        : ''
    },
    {
      label: "Total Repayable",
      value: application.jsonb_data?.financialDetails?.grossLoan
        ? `$${application.jsonb_data?.financialDetails?.grossLoan}`
        : ''
    },
    {
      label: "Gross Salary",
      value: application.jsonb_data?.employmentDetails?.salary
        ? `$${application.jsonb_data?.employmentDetails?.salary}`
        : ''
    },
    {
      label: "Net Income",
      value: application.jsonb_data?.financialDetails?.monthlyIncome
        ? `$${application.jsonb_data?.financialDetails?.monthlyIncome}`
        : ''
    }
  ];

  return <ApplicationSection title="Loan Details" fields={fields} />;
};

export default LoanDetailsSection;
