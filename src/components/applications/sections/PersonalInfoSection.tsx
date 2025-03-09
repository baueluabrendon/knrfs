
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";

interface PersonalInfoSectionProps {
  application: LoanApplicationType;
}

const PersonalInfoSection = ({ application }: PersonalInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Name",
      value: `${application.jsonb_data?.personalDetails?.firstName || ''} ${application.jsonb_data?.personalDetails?.middleName || ''} ${application.jsonb_data?.personalDetails?.lastName || ''}`.trim()
    },
    {
      label: "Date of Birth",
      value: application.jsonb_data?.personalDetails?.dateOfBirth || ''
    },
    {
      label: "Gender",
      value: application.jsonb_data?.personalDetails?.gender || ''
    },
    {
      label: "Email",
      value: application.jsonb_data?.personalDetails?.email || ''
    },
    {
      label: "Phone",
      value: application.jsonb_data?.personalDetails?.phone || ''
    },
    {
      label: "ID",
      value: application.jsonb_data?.personalDetails?.idNumber 
        ? `${application.jsonb_data?.personalDetails?.idType || ''} - ${application.jsonb_data?.personalDetails?.idNumber}`
        : ''
    }
  ];

  return <ApplicationSection title="Personal Information" fields={fields} />;
};

export default PersonalInfoSection;
