import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ClientProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['client-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('borrowers')
        .select('*')
        .eq('borrower_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profile?.given_name} {profile?.surname}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profile?.mobile_number || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Employer</p>
              <p className="font-medium">{profile?.department_company || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Position</p>
              <p className="font-medium">{profile?.position || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Work Phone</p>
              <p className="font-medium">{profile?.work_phone_number || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Street</p>
              <p className="font-medium">{profile?.street_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Suburb</p>
              <p className="font-medium">{profile?.suburb || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Province</p>
              <p className="font-medium">{profile?.province || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Bank Name</p>
              <p className="font-medium">{profile?.bank || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Name</p>
              <p className="font-medium">{profile?.account_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="font-medium">{profile?.account_number || '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfile;