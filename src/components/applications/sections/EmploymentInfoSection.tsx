
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";

interface EmploymentInfoSectionProps {
  application: LoanApplicationType;
}

const EmploymentInfoSection = ({ application }: EmploymentInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Employer",
      value: application.jsonb_data?.employmentDetails?.employerName || ''
    },
    {
      label: "Occupation",
      value: application.jsonb_data?.employmentDetails?.occupation || ''
    },
    {
      label: "Employed Since",
      value: application.jsonb_data?.employmentDetails?.employmentDate || ''
    },
    {
      label: "Salary",
      value: application.jsonb_data?.employmentDetails?.salary || ''
    },
    {
      label: "Pay Day",
      value: application.jsonb_data?.employmentDetails?.payDay || ''
    }
  ];

  return <ApplicationSection title="Employment Information" fields={fields} />;
};

export default EmploymentInfoSection;
