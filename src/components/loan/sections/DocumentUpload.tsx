import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Briefcase, LandmarkIcon, Lock, Upload } from "lucide-react";
import { toast } from "sonner";

type EmployerType = 'public' | 'statutory' | 'company' | null;

interface DocumentUpload {
  name: string;
  file: File | null;
  required: boolean;
  employerTypes: EmployerType[];
}

interface DocumentUploadProps {
  currentStep: number;
  selectedEmployerType: EmployerType;
  documents: Record<string, DocumentUpload>;
  onEmployerTypeSelect: (type: EmployerType) => void;
  onFileUpload: (documentKey: string, file: File) => void;
}

export const DocumentUpload = ({
  currentStep,
  selectedEmployerType,
  documents,
  onEmployerTypeSelect,
  onFileUpload,
}: DocumentUploadProps) => {
  const isDocumentEnabled = (doc: DocumentUpload) => {
    if (!selectedEmployerType) return false;
    return doc.required || doc.employerTypes.includes(selectedEmployerType);
  };

  const renderUploadBox = (key: string, doc: DocumentUpload) => {
    const isEnabled = isDocumentEnabled(doc);
    return (
      <div className="space-y-1.5 w-full">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {doc.name}
          {doc.required && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
          <div className={`flex items-center justify-center w-full h-16 px-3 transition bg-white border border-gray-200 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary/50 focus:outline-none ${!isEnabled && 'opacity-50 cursor-not-allowed'}`}>
            <Input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={!isEnabled}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(key, file);
              }}
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {!isEnabled ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{`Upload ${doc.name}`}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Initial Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(documents)
            .filter(([key]) => ["applicationForm", "termsAndConditions"].includes(key))
            .map(([key, doc]) => renderUploadBox(key, doc))}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Required Documents</h2>
        
        <div className="flex gap-3 mb-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(documents)
            .filter(([key]) => !["applicationForm", "termsAndConditions"].includes(key))
            .map(([key, doc]) => renderUploadBox(key, doc))}
        </div>
      </div>
    );
  }

  return null;
};