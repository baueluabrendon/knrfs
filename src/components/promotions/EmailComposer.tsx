import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmailComposerProps {
  subject: string;
  content: string;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  templates?: Array<{id: string; name: string; subject: string; content: string}>;
  onTemplateSelect?: (template: any) => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  subject,
  content,
  onSubjectChange,
  onContentChange,
  templates = [],
  onTemplateSelect
}) => {
  return (
    <Card className="professional-card">
      <div className="card-spacing">
        <div className="heading-3">Email Composition</div>
        
        {templates.length > 0 && (
          <div className="mb-6">
            <Label htmlFor="template-select" className="text-sm font-medium text-foreground">
              Use Template (Optional)
            </Label>
            <Select onValueChange={(value) => {
              const template = templates.find(t => t.id === value);
              if (template && onTemplateSelect) {
                onTemplateSelect(template);
              }
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="email-subject" className="text-sm font-medium text-foreground">
              Email Subject *
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Enter email subject..."
              className="mt-2 professional-input"
            />
          </div>

          <div>
            <Label htmlFor="email-content" className="text-sm font-medium text-foreground">
              Email Content *
            </Label>
            <Textarea
              id="email-content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Compose your promotional email content here..."
              className="mt-2 professional-input min-h-[200px]"
            />
            <div className="mt-2 small-text">
              Use HTML formatting if needed. Variables: {'{{name}}'} for recipient name, {'{{company}}'} for company name.
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Preview</h4>
          <div className="bg-card border border-border rounded p-4">
            <div className="font-medium text-sm text-muted-foreground mb-2">
              Subject: {subject || "No subject"}
            </div>
            <div className="text-sm body-text">
              {content || "No content"}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};