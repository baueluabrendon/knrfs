
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { uploadGroupRepaymentDocument } from "@/contexts/loan-application/document-uploader";

interface DocumentUploadProps {
  documentFile: File | null;
  setDocumentFile: (file: File | null) => void;
  documentUrl: string | null;
  setDocumentUrl: (url: string | null) => void;
  isUploadingDocument: boolean;
  setIsUploadingDocument: (isUploading: boolean) => void;
}

const DocumentUpload = ({
  documentFile,
  setDocumentFile,
  documentUrl,
  setDocumentUrl,
  isUploadingDocument,
  setIsUploadingDocument
}: DocumentUploadProps) => {
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDocument(true);
    setDocumentFile(file);

    try {
      const documentPath = await uploadGroupRepaymentDocument(file);
      
      if (documentPath) {
        setDocumentUrl(documentPath);
        toast.success("Repayment document uploaded successfully");
      } else {
        toast.error("Failed to upload repayment document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Error uploading document. Please try again.");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDocumentUploadClick = () => {
    if (documentFileInputRef.current) {
      documentFileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Repayment Group Document</Label>
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          ref={documentFileInputRef}
          onChange={handleDocumentUpload}
          disabled={isUploadingDocument}
        />
        <Button 
          variant="outline"
          onClick={handleDocumentUploadClick} 
          disabled={isUploadingDocument}
          className="flex-shrink-0 w-auto"
        >
          {isUploadingDocument ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Upload the source document for this group of repayments
      </p>
      
      {documentFile && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <FileText className="mr-2 h-4 w-4" />
          {documentFile.name}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
