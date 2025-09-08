import { supabase } from "@/integrations/supabase/client";
import { PromotionCampaign, PromotionRecipient } from "@/types/promotion";

export interface SendCampaignRequest {
  campaign: PromotionCampaign;
  microserviceEndpoint?: string;
}

export interface SendCampaignResponse {
  success: boolean;
  campaignId: string;
  sentCount: number;
  failedCount: number;
  message: string;
}

/**
 * Send promotional campaign via Python microservice
 */
export const sendPromotionalCampaign = async (
  campaign: PromotionCampaign,
  microserviceEndpoint?: string
): Promise<SendCampaignResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-promotion', {
      body: {
        campaign,
        microserviceEndpoint
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to send campaign');
    }

    return data;
  } catch (error) {
    console.error('Error sending promotional campaign:', error);
    throw error;
  }
};

/**
 * Save campaign to database (for persistence)
 */
export const saveCampaign = async (campaign: Partial<PromotionCampaign>): Promise<PromotionCampaign> => {
  try {
    // In a real implementation, you would save to a campaigns table
    // For now, we'll return the campaign with an ID
    const savedCampaign: PromotionCampaign = {
      id: campaign.id || `campaign_${Date.now()}`,
      title: campaign.title || '',
      description: campaign.description || '',
      emailSubject: campaign.emailSubject || '',
      emailContent: campaign.emailContent || '',
      attachments: campaign.attachments || [],
      recipients: campaign.recipients || [],
      status: campaign.status || 'draft',
      createdAt: campaign.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: campaign.createdBy || 'current_user',
      scheduledAt: campaign.scheduledAt,
      sentAt: campaign.sentAt,
      sentCount: campaign.sentCount,
      openRate: campaign.openRate,
      clickRate: campaign.clickRate
    };

    return savedCampaign;
  } catch (error) {
    console.error('Error saving campaign:', error);
    throw error;
  }
};

/**
 * Get campaigns list
 */
export const getCampaigns = async (): Promise<PromotionCampaign[]> => {
  try {
    // In real implementation, fetch from database
    // For now, return empty array - campaigns will be managed in component state
    return [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

/**
 * Upload promotion attachment
 */
export const uploadPromotionAttachment = async (
  file: File,
  campaignId: string
): Promise<{ url: string; path: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${campaignId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('promotion-attachments')
      .upload(fileName, file);

    if (error) {
      throw new Error(error.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('promotion-attachments')
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

/**
 * Delete promotion attachment
 */
export const deletePromotionAttachment = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('promotion-attachments')
      .remove([path]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};

/**
 * Get clients/borrowers for recipients
 */
export const getClientsForPromotion = async (): Promise<PromotionRecipient[]> => {
  try {
    // Fetch from borrowers table - adjust column names as needed
    const { data, error } = await supabase
      .from('borrowers')
      .select('*')
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((borrower: any) => ({
      id: borrower.id || `temp_${Date.now()}`,
      name: borrower.name || `${borrower.first_name || ''} ${borrower.last_name || ''}`.trim() || 'Unknown',
      email: borrower.email || '',
      status: 'pending' as const
    })).filter(recipient => recipient.email);
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Return empty array as fallback
    return [];
  }
};

/**
 * Track campaign metrics (opens, clicks, etc.)
 */
export const trackCampaignEvent = async (
  campaignId: string,
  recipientId: string,
  eventType: 'delivered' | 'opened' | 'clicked',
  timestamp?: string
): Promise<void> => {
  try {
    // In real implementation, save to campaign_events table
    console.log('Tracking event:', { campaignId, recipientId, eventType, timestamp });
  } catch (error) {
    console.error('Error tracking campaign event:', error);
    throw error;
  }
};