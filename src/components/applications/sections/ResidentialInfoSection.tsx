
import { LoanApplicationType } from "@/types/loan";

interface ResidentialInfoSectionProps {
  application: LoanApplicationType;
}

const ResidentialInfoSection = ({ application }: ResidentialInfoSectionProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Residential Information</h3>
      <div className="grid grid-cols-2 gap-2">
        <p><span className="font-medium">Address:</span> {application.jsonb_data?.residentialDetails?.address}</p>
        <p><span className="font-medium">Suburb:</span> {application.jsonb_data?.residentialDetails?.suburb}</p>
        <p><span className="font-medium">City:</span> {application.jsonb_data?.residentialDetails?.city}</p>
        <p><span className="font-medium">Province:</span> {application.jsonb_data?.residentialDetails?.province}</p>
        <p><span className="font-medium">Postal Code:</span> {application.jsonb_data?.residentialDetails?.postalCode}</p>
        <p><span className="font-medium">Years at Address:</span> {application.jsonb_data?.residentialDetails?.yearsAtAddress}</p>
      </div>
    </div>
  );
};

export default ResidentialInfoSection;
