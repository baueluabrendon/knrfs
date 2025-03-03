
import { LoanApplicationType } from "@/types/loan";

interface EmploymentInfoSectionProps {
  application: LoanApplicationType;
}

const EmploymentInfoSection = ({ application }: EmploymentInfoSectionProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
      <div className="grid grid-cols-2 gap-2">
        <p><span className="font-medium">Employer:</span> {application.jsonb_data?.employmentDetails?.employerName}</p>
        <p><span className="font-medium">Occupation:</span> {application.jsonb_data?.employmentDetails?.occupation}</p>
        <p><span className="font-medium">Employed Since:</span> {application.jsonb_data?.employmentDetails?.employmentDate}</p>
        <p><span className="font-medium">Salary:</span> {application.jsonb_data?.employmentDetails?.salary}</p>
        <p><span className="font-medium">Pay Day:</span> {application.jsonb_data?.employmentDetails?.payDay}</p>
      </div>
    </div>
  );
};

export default EmploymentInfoSection;
