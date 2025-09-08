import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PromotionCampaign, PromotionAttachment, PromotionRecipient } from "@/types/promotion";
import { EmailComposer } from "./EmailComposer";
import { FileUpload } from "./FileUpload";
import { ClientListManager } from "./ClientListManager";

interface CampaignFormProps {
  campaign?: PromotionCampaign;
  onSave: (campaign: Partial<PromotionCampaign>) => void;
  onCancel: () => void;
  onSend?: (campaign: Partial<PromotionCampaign>) => void;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
  campaign,
  onSave,
  onCancel,
  onSend
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [attachments, setAttachments] = useState<PromotionAttachment[]>([]);
  const [recipients, setRecipients] = useState<PromotionRecipient[]>([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      setEmailSubject(campaign.emailSubject);
      setEmailContent(campaign.emailContent);
      setAttachments(campaign.attachments || []);
      setRecipients(campaign.recipients || []);
    }
  }, [campaign]);

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a campaign title",
        variant: "destructive"
      });
      return false;
    }

    if (!emailSubject.trim()) {
      toast({
        title: "Missing email subject",
        description: "Please provide an email subject",
        variant: "destructive"
      });
      return false;
    }

    if (!emailContent.trim()) {
      toast({
        title: "Missing email content",
        description: "Please provide email content",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const campaignData: Partial<PromotionCampaign> = {
        id: campaign?.id,
        title: title.trim(),
        description: description.trim(),
        emailSubject: emailSubject.trim(),
        emailContent: emailContent.trim(),
        attachments,
        recipients,
        status: 'draft',
        updatedAt: new Date().toISOString()
      };

      if (!campaign) {
        campaignData.createdAt = new Date().toISOString();
      }

      onSave(campaignData);

      toast({
        title: "Campaign saved",
        description: "Campaign has been saved as draft"
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one recipient",
        variant: "destructive"
      });
      return;
    }

    setSending(true);

    try {
      const campaignData: Partial<PromotionCampaign> = {
        id: campaign?.id,
        title: title.trim(),
        description: description.trim(),
        emailSubject: emailSubject.trim(),
        emailContent: emailContent.trim(),
        attachments,
        recipients,
        status: 'sent',
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!campaign) {
        campaignData.createdAt = new Date().toISOString();
      }

      if (onSend) {
        onSend(campaignData);
      } else {
        onSave(campaignData);
      }

      toast({
        title: "Campaign sent",
        description: `Campaign sent to ${recipients.length} recipient(s)`
      });
    } catch (error) {
      toast({
        title: "Send failed",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Mock templates - in real app, fetch from database
  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Offer',
      subject: 'Welcome to {{company}} - Special Offer Inside!',
      content: 'Hello {{name}},\n\nWelcome to {{company}}! We are excited to have you as our valued client.\n\nAs a special welcome gift, we are offering you an exclusive promotion...\n\nBest regards,\nThe {{company}} Team'
    },
    {
      id: 'seasonal',
      name: 'Seasonal Promotion',
      subject: 'Don\'t Miss Our Seasonal Offer - Limited Time!',
      content: 'Dear {{name}},\n\nThis season, we have something special for you! Take advantage of our limited-time offer...\n\nVisit us today or contact our team to learn more.\n\nWarm regards,\n{{company}}'
    }
  ];

  const handleTemplateSelect = (template: any) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    toast({
      title: "Template applied",
      description: `${template.name} template has been applied`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="heading-1 mb-0">
              {campaign ? 'Edit Campaign' : 'New Campaign'}
            </h1>
            <div className="body-text">
              {campaign ? 'Update your promotional campaign' : 'Create a new promotional campaign'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || sending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={saving || sending || recipients.length === 0}
            className="professional-button"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Campaign'}
          </Button>
        </div>
      </div>

      {/* Campaign Details */}
      <Card className="professional-card">
        <div className="card-spacing">
          <div className="heading-3">Campaign Details</div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="campaign-title" className="text-sm font-medium text-foreground">
                Campaign Title *
              </Label>
              <Input
                id="campaign-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter campaign title"
                className="mt-2 professional-input"
              />
            </div>
            
            <div>
              <Label htmlFor="campaign-description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="campaign-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the campaign"
                className="mt-2 professional-input"
                rows={3}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Email Composition */}
      <EmailComposer
        subject={emailSubject}
        content={emailContent}
        onSubjectChange={setEmailSubject}
        onContentChange={setEmailContent}
        templates={emailTemplates}
        onTemplateSelect={handleTemplateSelect}
      />

      {/* File Upload */}
      <FileUpload
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />

      {/* Recipients Management */}
      <ClientListManager
        recipients={recipients}
        onRecipientsChange={setRecipients}
      />
    </div>
  );
};