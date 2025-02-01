import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Briefcase, LandmarkIcon, Lock } from "lucide-react";
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

  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Initial Documents</h2>
        <div className="grid gap-4">
          {Object.entries(documents)
            .filter(([key]) => ["applicationForm", "termsAndConditions"].includes(key))
            .map(([key, doc]) => (
              <div key={key} className="space-y-2">
                <Label>{doc.name}</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileUpload(key, file);
                  }}
                />
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Required Documents</h2>
        
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => onEmployerTypeSelect('public')}
            variant={selectedEmployerType === 'public' ? 'default' : 'outline'}
            className="flex-1"
          >
            <LandmarkIcon className="mr-2 h-4 w-4" />
            Public Service
          </Button>
          <Button
            onClick={() => onEmployerTypeSelect('statutory')}
            variant={selectedEmployerType === 'statutory' ? 'default' : 'outline'}
            className="flex-1"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Statutory Body
          </Button>
          <Button
            onClick={() => onEmployerTypeSelect('company')}
            variant={selectedEmployerType === 'company' ? 'default' : 'outline'}
            className="flex-1"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Company
          </Button>
        </div>

        <div className="grid gap-4">
          {Object.entries(documents)
            .filter(([key]) => !["applicationForm", "termsAndConditions"].includes(key))
            .map(([key, doc]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>{doc.name}</Label>
                  {doc.required && <span className="text-red-500">*</span>}
                  {!isDocumentEnabled(doc) && <Lock className="h-4 w-4 text-gray-400" />}
                </div>
                <Input
                  type="file"
                  disabled={!isDocumentEnabled(doc)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileUpload(key, file);
                  }}
                />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return null;
};