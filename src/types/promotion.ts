export interface PromotionCampaign {
  id?: string;
  title: string;
  description: string;
  emailSubject: string;
  emailContent: string;
  attachments: PromotionAttachment[];
  recipients: PromotionRecipient[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
}

export interface PromotionAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface PromotionRecipient {
  id?: string;
  name: string;
  email: string;
  status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

export interface PromotionTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
}