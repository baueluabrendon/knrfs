import { useState } from "react";
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
      <div className="space-y-2 w-full">
        <Label className="text-sm font-medium text-gray-700">{doc.name}</Label>
        <div className="relative">
          <div className={`flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none ${!isEnabled && 'opacity-50 cursor-not-allowed'}`}>
            <Input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={!isEnabled}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(key, file);
              }}
            />
            <div className="flex flex-col items-center justify-center">
              {!isEnabled ? (
                <Lock className="w-6 h-6 text-gray-400" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
              <span className="mt-2 text-sm text-gray-500">
                {`Upload ${doc.name}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Initial Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(documents)
            .filter(([key]) => ["applicationForm", "termsAndConditions"].includes(key))
            .map(([key, doc]) => renderUploadBox(key, doc))}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(documents)
            .filter(([key]) => !["applicationForm", "termsAndConditions"].includes(key))
            .map(([key, doc]) => renderUploadBox(key, doc))}
        </div>
      </div>
    );
  }

  return null;
};