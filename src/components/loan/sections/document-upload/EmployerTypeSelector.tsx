import { Button } from "@/components/ui/button";
import { Building2, Briefcase, LandmarkIcon } from "lucide-react";
import { EmployerType } from "@/types/loan";

interface EmployerTypeSelectorProps {
  selectedEmployerType: EmployerType;
  onEmployerTypeSelect: (type: EmployerType) => void;
}

export const EmployerTypeSelector = ({
  selectedEmployerType,
  onEmployerTypeSelect,
}: EmployerTypeSelectorProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        onClick={() => onEmployerTypeSelect('public')}
        variant={selectedEmployerType === 'public' ? 'default' : 'outline'}
        className="flex-1"
        size="sm"
      >
        <LandmarkIcon className="mr-2 h-4 w-4" />
        Public Service
      </Button>
      <Button
        onClick={() => onEmployerTypeSelect('statutory')}
        variant={selectedEmployerType === 'statutory' ? 'default' : 'outline'}
        className="flex-1"
        size="sm"
      >
        <Building2 className="mr-2 h-4 w-4" />
        Statutory Body
      </Button>
      <Button
        onClick={() => onEmployerTypeSelect('company')}
        variant={selectedEmployerType === 'company' ? 'default' : 'outline'}
        className="flex-1"
        size="sm"
      >
        <Briefcase className="mr-2 h-4 w-4" />
        Company
      </Button>
    </div>
  );
};