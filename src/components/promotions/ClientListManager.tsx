import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Upload, Users, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PromotionRecipient } from "@/types/promotion";

interface ClientListManagerProps {
  recipients: PromotionRecipient[];
  onRecipientsChange: (recipients: PromotionRecipient[]) => void;
}

export const ClientListManager: React.FC<ClientListManagerProps> = ({
  recipients,
  onRecipientsChange
}) => {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const { toast } = useToast();

  const addSingleRecipient = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and email",
        variant: "destructive"
      });
      return;
    }

    if (!isValidEmail(newEmail)) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (recipients.some(r => r.email.toLowerCase() === newEmail.toLowerCase())) {
      toast({
        title: "Duplicate email",
        description: "This email is already in the recipient list",
        variant: "destructive"
      });
      return;
    }

    const newRecipient: PromotionRecipient = {
      id: `recipient_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      status: 'pending'
    };

    onRecipientsChange([...recipients, newRecipient]);
    setNewName('');
    setNewEmail('');
    
    toast({
      title: "Recipient added",
      description: `${newName} has been added to the recipient list`
    });
  };

  const addBulkRecipients = () => {
    if (!bulkEmails.trim()) {
      toast({
        title: "No emails provided",
        description: "Please enter email addresses",
        variant: "destructive"
      });
      return;
    }

    const lines = bulkEmails.split('\n').filter(line => line.trim());
    const newRecipients: PromotionRecipient[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length >= 2) {
        const name = parts[0];
        const email = parts[1];
        
        if (!isValidEmail(email)) {
          errors.push(`Line ${index + 1}: Invalid email "${email}"`);
          return;
        }

        if (recipients.some(r => r.email.toLowerCase() === email.toLowerCase()) ||
            newRecipients.some(r => r.email.toLowerCase() === email.toLowerCase())) {
          errors.push(`Line ${index + 1}: Duplicate email "${email}"`);
          return;
        }

        newRecipients.push({
          id: `recipient_${Date.now()}_${index}`,
          name,
          email: email.toLowerCase(),
          status: 'pending'
        });
      } else {
        errors.push(`Line ${index + 1}: Invalid format. Use "Name, Email"`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Import errors",
        description: errors.slice(0, 3).join(', ') + (errors.length > 3 ? '...' : ''),
        variant: "destructive"
      });
    }

    if (newRecipients.length > 0) {
      onRecipientsChange([...recipients, ...newRecipients]);
      setBulkEmails('');
      toast({
        title: "Recipients imported",
        description: `${newRecipients.length} recipient(s) added successfully`
      });
    }
  };

  const removeRecipient = (id: string) => {
    onRecipientsChange(recipients.filter(r => r.id !== id));
    toast({
      title: "Recipient removed",
      description: "Recipient has been removed from the list"
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const loadFromDatabase = () => {
    // This would typically fetch from your borrowers/clients database
    toast({
      title: "Feature coming soon",
      description: "Integration with client database will be available soon",
      variant: "default"
    });
  };

  return (
    <Card className="professional-card">
      <div className="card-spacing">
        <div className="flex items-center justify-between mb-4">
          <div className="heading-3">Recipients ({recipients.length})</div>
          <Button
            variant="outline"
            onClick={loadFromDatabase}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Load from Database</span>
          </Button>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Add Individual</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient-name" className="text-sm font-medium text-foreground">
                  Name *
                </Label>
                <Input
                  id="recipient-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter client name"
                  className="mt-2 professional-input"
                />
              </div>
              <div>
                <Label htmlFor="recipient-email" className="text-sm font-medium text-foreground">
                  Email *
                </Label>
                <div className="flex mt-2 space-x-2">
                  <Input
                    id="recipient-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="professional-input"
                  />
                  <Button
                    onClick={addSingleRecipient}
                    disabled={!newName.trim() || !newEmail.trim()}
                    className="professional-button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div>
              <Label htmlFor="bulk-emails" className="text-sm font-medium text-foreground">
                Bulk Email List
              </Label>
              <Textarea
                id="bulk-emails"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                placeholder="Enter one recipient per line in format: Name, Email&#10;John Doe, john@example.com&#10;Jane Smith, jane@example.com"
                className="mt-2 professional-input min-h-[120px]"
              />
              <div className="mt-2 small-text">
                Format: One recipient per line as "Name, Email"
              </div>
            </div>
            <Button
              onClick={addBulkRecipients}
              disabled={!bulkEmails.trim()}
              className="professional-button"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Recipients
            </Button>
          </TabsContent>
        </Tabs>

        {recipients.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Recipient List
            </Label>
            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {recipient.name}
                      </div>
                      <div className="small-text">
                        {recipient.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {recipient.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient(recipient.id!)}
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