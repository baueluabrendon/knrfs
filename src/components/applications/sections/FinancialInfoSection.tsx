
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";

interface FinancialInfoSectionProps {
  application: LoanApplicationType;
}

const FinancialInfoSection = ({ application }: FinancialInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Bank",
      value: application.jsonb_data?.financialDetails?.bank || ''
    },
    {
      label: "Bank Branch",
      value: application.jsonb_data?.financialDetails?.bankBranch || ''
    },
    {
      label: "BSB Code",
      value: application.jsonb_data?.financialDetails?.bsbCode || ''
    },
    {
      label: "Account Name",
      value: application.jsonb_data?.financialDetails?.accountName || ''
    },
    {
      label: "Account Number",
      value: application.jsonb_data?.financialDetails?.accountNumber || ''
    },
    {
      label: "Account Type",
      value: application.jsonb_data?.financialDetails?.accountType || ''
    }
  ];

  return <ApplicationSection title="Financial Information" fields={fields} />;
};

export default FinancialInfoSection;
