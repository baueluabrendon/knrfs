import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClientTypeClassification } from "@/hooks/useClientTypeClassification";
import { Building2, Users, Calendar, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientTypeBreakdown() {
  const { data: clientTypes, isLoading, error } = useClientTypeClassification();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Type Classification</CardTitle>
          <CardDescription>Breakdown by employer type for collection scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !clientTypes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Type Classification</CardTitle>
          <CardDescription>Breakdown by employer type for collection scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load client type data</p>
        </CardContent>
      </Card>
    );
  }

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Building2 className="h-4 w-4" />;
      case 'statutory':
        return <Building2 className="h-4 w-4" />;
      case 'company':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'public':
        return 'Public Service';
      case 'statutory':
        return 'Statutory Body';
      case 'company':
        return 'Company';
      default:
        return 'Unclassified';
    }
  };

  const getScheduleBadgeVariant = (schedule: string) => {
    return schedule === 'fortnightly' ? 'default' : 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Type Classification
        </CardTitle>
        <CardDescription>
          Breakdown by employer type for repayment collection scheduling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientTypes.map((clientType) => (
            <div
              key={clientType.clientType}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getClientTypeIcon(clientType.clientType)}
                <div>
                  <h4 className="font-medium">
                    {getClientTypeLabel(clientType.clientType)}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {clientType.count} clients
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${clientType.totalOutstanding.toLocaleString()} outstanding
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getScheduleBadgeVariant(clientType.collectionSchedule)}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  {clientType.collectionSchedule}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {clientTypes.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No client type data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}