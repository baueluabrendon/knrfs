
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AILoanAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I can help you with loan-related insights, risk assessments, and answer questions about your loan portfolio.' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: AIMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/functions/ai-loan-assistant', {
        method: 'POST',
        body: JSON.stringify({ 
          messages: [...messages, newUserMessage],
          context: 'loan management system' 
        })
      });

      const data = await response.json();
      const assistantMessage: AIMessage = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: AIMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>AI Loan Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-blue-100 text-blue-800 ml-auto' 
                  : 'bg-gray-100 text-gray-800 mr-auto'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex space-x-2 mt-auto">
          <Input 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about loan management..."
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AILoanAssistant;
