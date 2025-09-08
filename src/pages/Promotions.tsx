import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Mail, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PromotionCampaign } from "@/types/promotion";
import { CampaignForm } from "@/components/promotions/CampaignForm";
import { CampaignList } from "@/components/promotions/CampaignList";

const Promotions = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingCampaign, setEditingCampaign] = useState<PromotionCampaign | undefined>();
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([
    // Mock data - in real app, fetch from database
    {
      id: 'campaign_1',
      title: 'Summer Loan Special',
      description: 'Special interest rates for summer season',
      emailSubject: 'Beat the Heat with Our Summer Loan Rates!',
      emailContent: 'Dear {{name}},\n\nThis summer, we are offering exclusive loan rates just for you...',
      attachments: [],
      recipients: [
        { id: 'r1', name: 'John Doe', email: 'john@example.com', status: 'sent' },
        { id: 'r2', name: 'Jane Smith', email: 'jane@example.com', status: 'delivered' }
      ],
      status: 'sent',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      sentAt: '2024-01-15T14:30:00Z',
      createdBy: 'admin',
      sentCount: 2,
      openRate: 85,
      clickRate: 42
    },
    {
      id: 'campaign_2',
      title: 'New Client Welcome Package',
      description: 'Welcome campaign for new borrowers',
      emailSubject: 'Welcome to Our Family - Exclusive Benefits Await!',
      emailContent: 'Hello {{name}},\n\nWelcome to our financial family! We are excited to serve you...',
      attachments: [],
      recipients: [
        { id: 'r3', name: 'Mike Johnson', email: 'mike@example.com', status: 'pending' }
      ],
      status: 'draft',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z',
      createdBy: 'admin'
    }
  ]);

  const { toast } = useToast();

  const handleNewCampaign = () => {
    setEditingCampaign(undefined);
    setView('form');
  };

  const handleEditCampaign = (campaign: PromotionCampaign) => {
    setEditingCampaign(campaign);
    setView('form');
  };

  const handleSaveCampaign = (campaignData: Partial<PromotionCampaign>) => {
    if (editingCampaign) {
      // Update existing campaign
      setCampaigns(prev => prev.map(c => 
        c.id === editingCampaign.id 
          ? { ...c, ...campaignData } 
          : c
      ));
    } else {
      // Create new campaign
      const newCampaign: PromotionCampaign = {
        id: `campaign_${Date.now()}`,
        createdBy: 'current_user',
        ...campaignData
      } as PromotionCampaign;
      
      setCampaigns(prev => [newCampaign, ...prev]);
    }
    
    setView('list');
    setEditingCampaign(undefined);
  };

  const handleSendCampaign = async (campaignData: Partial<PromotionCampaign>) => {
    try {
      // In real app, this would call the Python microservice
      console.log('Sending campaign via microservice:', campaignData);
      
      toast({
        title: "Campaign sent successfully",
        description: `Email sent to ${campaignData.recipients?.length} recipients`
      });
      
      handleSaveCampaign({
        ...campaignData,
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentCount: campaignData.recipients?.length || 0
      });
    } catch (error) {
      toast({
        title: "Send failed",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    toast({
      title: "Campaign deleted",
      description: "Campaign has been removed successfully"
    });
  };

  const handleViewCampaign = (campaign: PromotionCampaign) => {
    // For now, just show details in toast - could open a detailed view modal
    toast({
      title: campaign.title,
      description: `Status: ${campaign.status} | Recipients: ${campaign.recipients.length}`
    });
  };

  // Calculate summary statistics
  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients.length, 0);
  const avgOpenRate = campaigns
    .filter(c => c.openRate !== undefined)
    .reduce((sum, c, _, arr) => sum + (c.openRate || 0) / arr.length, 0);

  if (view === 'form') {
    return (
      <CampaignForm
        campaign={editingCampaign}
        onSave={handleSaveCampaign}
        onSend={handleSendCampaign}
        onCancel={() => {
          setView('list');
          setEditingCampaign(undefined);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-1">Promotional Campaigns</h1>
          <p className="body-text">Create and manage email marketing campaigns for your clients</p>
        </div>
        <Button onClick={handleNewCampaign} className="professional-button">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="professional-card card-spacing">
          <div className="flex items-center justify-between">
            <div>
              <div className="small-text">Total Campaigns</div>
              <div className="heading-2 mb-0">{totalCampaigns}</div>
            </div>
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div className="professional-card card-spacing">
          <div className="flex items-center justify-between">
            <div>
              <div className="small-text">Sent Campaigns</div>
              <div className="heading-2 mb-0">{sentCampaigns}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </div>
        
        <div className="professional-card card-spacing">
          <div className="flex items-center justify-between">
            <div>
              <div className="small-text">Total Recipients</div>
              <div className="heading-2 mb-0">{totalRecipients}</div>
            </div>
            <Users className="h-8 w-8 text-accent" />
          </div>
        </div>
        
        <div className="professional-card card-spacing">
          <div className="flex items-center justify-between">
            <div>
              <div className="small-text">Avg Open Rate</div>
              <div className="heading-2 mb-0">{avgOpenRate.toFixed(1)}%</div>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <CampaignList
        campaigns={campaigns}
        onEdit={handleEditCampaign}
        onView={handleViewCampaign}
        onDelete={handleDeleteCampaign}
        onSend={handleSendCampaign}
      />
    </div>
  );
};

export default Promotions;