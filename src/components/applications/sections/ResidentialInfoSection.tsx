
import { LoanApplicationType } from "@/types/loan";
import ApplicationSection, { SectionField } from "../common/ApplicationSection";

interface ResidentialInfoSectionProps {
  application: LoanApplicationType;
}

const ResidentialInfoSection = ({ application }: ResidentialInfoSectionProps) => {
  const fields: SectionField[] = [
    {
      label: "Address",
      value: application.jsonb_data?.residentialDetails?.address || ''
    },
    {
      label: "Suburb",
      value: application.jsonb_data?.residentialDetails?.suburb || ''
    },
    {
      label: "City",
      value: application.jsonb_data?.residentialDetails?.city || ''
    },
    {
      label: "Province",
      value: application.jsonb_data?.residentialDetails?.province || ''
    },
    {
      label: "Postal Code",
      value: application.jsonb_data?.residentialDetails?.postalCode || ''
    },
    {
      label: "Years at Address",
      value: application.jsonb_data?.residentialDetails?.yearsAtAddress || ''
    }
  ];

  return <ApplicationSection title="Residential Information" fields={fields} />;
};

export default ResidentialInfoSection;
