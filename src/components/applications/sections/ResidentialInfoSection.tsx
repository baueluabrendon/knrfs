
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";

interface ResidentialInfoSectionProps {
  application: LoanApplicationType;
}

const ResidentialInfoSection = ({ application }: ResidentialInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Lot",
      value: application.jsonb_data?.residentialDetails?.lot || ''
    },
    {
      label: "Section",
      value: application.jsonb_data?.residentialDetails?.section || ''
    },
    {
      label: "Suburb",
      value: application.jsonb_data?.residentialDetails?.suburb || ''
    },
    {
      label: "Street Name",
      value: application.jsonb_data?.residentialDetails?.streetName || ''
    },
    {
      label: "Marital Status",
      value: application.jsonb_data?.personalDetails?.maritalStatus || ''
    },
    {
      label: "Spouse Last Name",
      value: application.jsonb_data?.personalDetails?.spouseLastName || ''
    },
    {
      label: "Spouse First Name",
      value: application.jsonb_data?.personalDetails?.spouseFirstName || ''
    },
    {
      label: "Spouse Employer Name",
      value: application.jsonb_data?.personalDetails?.spouseEmployerName || ''
    },
    {
      label: "Spouse Contact Details",
      value: application.jsonb_data?.personalDetails?.spouseContactDetails || ''
    }
  ];

  return <ApplicationSection title="Residential Information" fields={fields} />;
};

export default ResidentialInfoSection;
