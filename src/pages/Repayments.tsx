
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import RepaymentDialog from "@/components/repayments/RepaymentDialog";
import RepaymentsTable from "@/components/repayments/RepaymentsTable";
import { supabase } from "@/lib/supabase";
import { Repayment } from "@/types/repayment";

const Repayments = () => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRepayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('repayments')
        .select('*');
      
      if (error) {
        console.error('Error fetching repayments:', error);
      } else {
        setRepayments(data as Repayment[]);
      }
    } catch (error) {
      console.error('Error in fetchRepayments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Refresh repayments when dialog is closed
      fetchRepayments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Repayments Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/repayments/bulk">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Link>
          </Button>
          <RepaymentDialog 
            isOpen={isDialogOpen} 
            onOpenChange={handleDialogOpenChange} 
          />
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading repayments...</div>
        ) : (
          <RepaymentsTable repayments={repayments} />
        )}
      </Card>
    </div>
  );
};

export default Repayments;
