
import { LoanApplicationType } from "@/types/loan";

interface ApplicationDetailsPanelProps {
  application: LoanApplicationType;
}

const ApplicationDetailsPanel = ({ application }: ApplicationDetailsPanelProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="space-y-4">
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
      </div>

      <div className="space-y-4">
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

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Loan Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-medium">Amount:</span> ${application.jsonb_data?.financialDetails?.loanAmount}</p>
            <p><span className="font-medium">Purpose:</span> {application.jsonb_data?.financialDetails?.loanPurpose}</p>
            <p><span className="font-medium">Term:</span> {application.jsonb_data?.financialDetails?.loanTerm}</p>
            <p><span className="font-medium">Bi-weekly Payment:</span> ${application.jsonb_data?.financialDetails?.fortnightlyInstallment}</p>
            <p><span className="font-medium">Gross Loan:</span> ${application.jsonb_data?.financialDetails?.grossLoan}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPanel;
