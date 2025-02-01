import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentUploadType } from "@/types/loan";

interface DocumentUploadBoxProps {
  documentKey: string;
  document: DocumentUploadType;
  isEnabled: boolean;
  onFileUpload: (documentKey: string, file: File) => void;
}

export const DocumentUploadBox = ({
  documentKey,
  document,
  isEnabled,
  onFileUpload,
}: DocumentUploadBoxProps) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {document.name}
        {document.required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <div className={`flex items-center justify-center w-full h-12 px-3 transition bg-white border border-gray-200 border-dashed rounded-md appearance-none hover:border-primary/50 focus:outline-none ${!isEnabled && 'opacity-50 cursor-not-allowed'}`}>
          <Input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={!isEnabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(documentKey, file);
            }}
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Upload className="w-4 h-4" />
            <span>{`Upload ${document.name}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};