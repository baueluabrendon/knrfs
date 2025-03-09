
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";

interface EmploymentInfoSectionProps {
  application: LoanApplicationType;
}

const EmploymentInfoSection = ({ application }: EmploymentInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Department/Company",
      value: application.jsonb_data?.employmentDetails?.employerName || ''
    },
    {
      label: "Position",
      value: application.jsonb_data?.employmentDetails?.position || ''
    },
    {
      label: "File Number",
      value: application.jsonb_data?.employmentDetails?.fileNumber || ''
    },
    {
      label: "Postal Address",
      value: application.jsonb_data?.employmentDetails?.postalAddress || ''
    },
    {
      label: "Work Phone Number",
      value: application.jsonb_data?.employmentDetails?.workPhoneNumber || ''
    },
    {
      label: "Fax",
      value: application.jsonb_data?.employmentDetails?.fax || ''
    },
    {
      label: "Date Employed",
      value: application.jsonb_data?.employmentDetails?.employmentDate || ''
    },
    {
      label: "Paymaster",
      value: application.jsonb_data?.employmentDetails?.paymaster || ''
    }
  ];

  return <ApplicationSection title="Employment Information" fields={fields} />;
};

export default EmploymentInfoSection;
