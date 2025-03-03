
import { LoanApplicationType } from "@/types/loan";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import EmploymentInfoSection from "./sections/EmploymentInfoSection";
import ResidentialInfoSection from "./sections/ResidentialInfoSection";
import LoanInfoSection from "./sections/LoanInfoSection";

interface ApplicationDetailsPanelProps {
  application: LoanApplicationType;
}

const ApplicationDetailsPanel = ({ application }: ApplicationDetailsPanelProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="space-y-4">
        <PersonalInfoSection application={application} />
        <EmploymentInfoSection application={application} />
      </div>

      <div className="space-y-4">
        <ResidentialInfoSection application={application} />
        <LoanInfoSection application={application} />
      </div>
    </div>
  );
};

export default ApplicationDetailsPanel;
