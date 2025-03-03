
import { DocumentUploadType } from "@/types/loan";
import { DocumentUploadBox } from "./DocumentUploadBox";

interface DocumentListProps {
  documents: Record<string, DocumentUploadType>;
  filter: (key: string) => boolean;
  isDocumentEnabled: (doc: DocumentUploadType) => boolean;
  handleFileUpload: (documentKey: string, file: File) => void;
  isUploading: boolean;
}

export const DocumentList = ({ 
  documents, 
  filter, 
  isDocumentEnabled, 
  handleFileUpload,
  isUploading
}: DocumentListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(documents)
        .filter(([key]) => filter(key))
        .map(([key, doc]) => (
          <DocumentUploadBox
            key={key}
            documentKey={key}
            document={doc}
            isEnabled={isDocumentEnabled(doc)}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />
        ))}
    </div>
  );
};
