
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { useBulkRepayments } from "@/hooks/useBulkRepayments";
import CSVUpload from "@/components/repayments/CSVUpload";
import DocumentUpload from "@/components/repayments/DocumentUpload";
import RepaymentPreviewTable from "@/components/repayments/RepaymentPreviewTable";

const BulkRepayments = () => {
  const {
    parsedData,
    setParsedData,
    csvFile,
    setCsvFile,
    isParsingCSV,
    setIsParsingCSV,
    isUploadingDocument,
    setIsUploadingDocument,
    documentFile,
    setDocumentFile,
    documentUrl,
    setDocumentUrl,
    isSubmitting,
    handleSubmitRepayments,
    handleCancelUpload
  } = useBulkRepayments();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Bulk Repayments Upload</h1>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <CSVUpload
              onParsedData={setParsedData}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              isParsingCSV={isParsingCSV}
              setIsParsingCSV={setIsParsingCSV}
            />
            
            <DocumentUpload
              documentFile={documentFile}
              setDocumentFile={setDocumentFile}
              documentUrl={documentUrl}
              setDocumentUrl={setDocumentUrl}
              isUploadingDocument={isUploadingDocument}
              setIsUploadingDocument={setIsUploadingDocument}
            />
          </div>
          
          {parsedData.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Preview ({parsedData.length} repayments)</h2>
              </div>
              
              <RepaymentPreviewTable repayments={parsedData} />
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={handleCancelUpload}
                  className="w-full md:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitRepayments} 
                  disabled={isSubmitting || !documentUrl}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Repayments"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BulkRepayments;
