import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Send, Trash2, Calendar, Users, Mail } from "lucide-react";
import { PromotionCampaign } from "@/types/promotion";

interface CampaignListProps {
  campaigns: PromotionCampaign[];
  onEdit: (campaign: PromotionCampaign) => void;
  onView: (campaign: PromotionCampaign) => void;
  onDelete: (campaignId: string) => void;
  onSend: (campaign: PromotionCampaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onEdit,
  onView,
  onDelete,
  onSend
}) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'outline',
      scheduled: 'default',
      sent: 'secondary',
      failed: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (campaigns.length === 0) {
    return (
      <Card className="professional-card">
        <div className="card-spacing text-center">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="heading-3">No campaigns yet</div>
          <div className="body-text">Create your first promotional campaign to get started.</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="professional-card">
          <div className="card-spacing">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="heading-3 mb-0">{campaign.title}</h3>
                  {getStatusBadge(campaign.status)}
                </div>
                
                <div className="body-text mb-3">{campaign.description}</div>
                
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{campaign.recipients.length} recipients</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(campaign.createdAt)}</span>
                  </div>
                  
                  {campaign.sentAt && (
                    <div className="flex items-center space-x-1">
                      <Send className="h-4 w-4" />
                      <span>Sent {formatDate(campaign.sentAt)}</span>
                    </div>
                  )}
                  
                  {campaign.sentCount !== undefined && (
                    <div className="text-success">
                      {campaign.sentCount} sent
                    </div>
                  )}
                </div>

                {(campaign.openRate !== undefined || campaign.clickRate !== undefined) && (
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    {campaign.openRate !== undefined && (
                      <div className="text-muted-foreground">
                        Open Rate: <span className="text-foreground font-medium">{campaign.openRate}%</span>
                      </div>
                    )}
                    {campaign.clickRate !== undefined && (
                      <div className="text-muted-foreground">
                        Click Rate: <span className="text-foreground font-medium">{campaign.clickRate}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(campaign)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {campaign.status === 'draft' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(campaign)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSend(campaign)}
                      disabled={campaign.recipients.length === 0}
                      className="professional-button"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(campaign.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};