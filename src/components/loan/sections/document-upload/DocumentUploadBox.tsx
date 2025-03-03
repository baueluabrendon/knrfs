
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentUploadType } from "@/types/loan";

interface DocumentUploadBoxProps {
  documentKey: string;
  document: DocumentUploadType;
  isEnabled: boolean;
  onFileUpload: (documentKey: string, file: File) => void;
  isUploading: boolean;
}

export const DocumentUploadBox = ({
  documentKey,
  document,
  isEnabled,
  onFileUpload,
  isUploading,
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
            disabled={!isEnabled || isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(documentKey, file);
            }}
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {document.file ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="truncate max-w-[180px]">{document.file.name}</span>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{`Upload ${document.name}`}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
