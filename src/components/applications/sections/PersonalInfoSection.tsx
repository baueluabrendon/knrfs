
import { LoanApplicationType } from "@/types/loan";

interface PersonalInfoSectionProps {
  application: LoanApplicationType;
}

const PersonalInfoSection = ({ application }: PersonalInfoSectionProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
      <div className="grid grid-cols-2 gap-2">
        <p><span className="font-medium">Name:</span> {application.jsonb_data?.personalDetails?.firstName} {application.jsonb_data?.personalDetails?.middleName} {application.jsonb_data?.personalDetails?.lastName}</p>
        <p><span className="font-medium">Date of Birth:</span> {application.jsonb_data?.personalDetails?.dateOfBirth}</p>
        <p><span className="font-medium">Gender:</span> {application.jsonb_data?.personalDetails?.gender}</p>
        <p><span className="font-medium">Email:</span> {application.jsonb_data?.personalDetails?.email}</p>
        <p><span className="font-medium">Phone:</span> {application.jsonb_data?.personalDetails?.phone}</p>
        <p><span className="font-medium">ID:</span> {application.jsonb_data?.personalDetails?.idType} - {application.jsonb_data?.personalDetails?.idNumber}</p>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
