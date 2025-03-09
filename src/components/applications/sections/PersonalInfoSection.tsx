
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";

interface PersonalInfoSectionProps {
  application: LoanApplicationType;
}

const PersonalInfoSection = ({ application }: PersonalInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Given Name",
      value: application.jsonb_data?.personalDetails?.firstName || ''
    },
    {
      label: "Surname",
      value: application.jsonb_data?.personalDetails?.lastName || ''
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
      label: "Mobile Number",
      value: application.jsonb_data?.personalDetails?.phone || ''
    },
    {
      label: "Email",
      value: application.jsonb_data?.personalDetails?.email || ''
    },
    {
      label: "Village",
      value: application.jsonb_data?.residentialDetails?.village || ''
    },
    {
      label: "District",
      value: application.jsonb_data?.residentialDetails?.district || ''
    },
    {
      label: "Province",
      value: application.jsonb_data?.residentialDetails?.province || ''
    },
    {
      label: "Nationality",
      value: application.jsonb_data?.personalDetails?.nationality || ''
    }
  ];

  return <ApplicationSection title="Personal Information" fields={fields} />;
};

export default PersonalInfoSection;
