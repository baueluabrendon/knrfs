import React, { useCallback, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, File, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PromotionAttachment } from "@/types/promotion";

interface FileUploadProps {
  attachments: PromotionAttachment[];
  onAttachmentsChange: (attachments: PromotionAttachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxFileSize = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    if (attachments.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const newAttachments: PromotionAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `File ${file.name} is not an allowed type`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `File ${file.name} exceeds ${maxFileSize}MB limit`,
            variant: "destructive"
          });
          continue;
        }

        // For now, create a mock attachment object
        // In real implementation, you would upload to storage service
        const attachment: PromotionAttachment = {
          id: `temp_${Date.now()}_${i}`,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file), // Temporary URL for preview
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        };

        newAttachments.push(attachment);
      }

      onAttachmentsChange([...attachments, ...newAttachments]);

      if (newAttachments.length > 0) {
        toast({
          title: "Files uploaded",
          description: `${newAttachments.length} file(s) uploaded successfully`
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [attachments, onAttachmentsChange, maxFiles, maxFileSize, allowedTypes, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== id));
    toast({
      title: "File removed",
      description: "Attachment removed from campaign"
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="professional-card">
      <div className="card-spacing">
        <div className="heading-3">Attachments & Flyers</div>
        
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="body-text mb-4">
            Drag & drop files here, or{' '}
            <Label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">
              browse files
            </Label>
          </div>
          <input
            id="file-upload"
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="small-text">
            Supported formats: JPEG, PNG, GIF, PDF • Max {maxFileSize}MB per file • Max {maxFiles} files
          </div>
        </div>

        {uploading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <div className="mt-2 small-text">Uploading files...</div>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Attached Files ({attachments.length}/{maxFiles})
            </Label>
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {attachment.fileName}
                      </div>
                      <div className="small-text">
                        {formatFileSize(attachment.fileSize)} • {attachment.fileType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {attachment.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};