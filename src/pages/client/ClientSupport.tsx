import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";

const ClientSupport = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Support</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <Button className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Call us directly for immediate assistance.
            </p>
            <Button className="w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Chat with our support team in real-time.
            </p>
            <Button className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">How do I apply for a loan?</h3>
            <p className="text-gray-500">
              You can apply for a loan by clicking on the "Apply for a New Loan" button in the sidebar menu.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">How long does the application process take?</h3>
            <p className="text-gray-500">
              The application process typically takes 2-3 business days from submission to approval.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What documents do I need to apply?</h3>
            <p className="text-gray-500">
              Required documents include proof of income, identification, and employment verification.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSupport;