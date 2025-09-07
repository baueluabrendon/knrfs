import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Promotions = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600 mt-2">Manage marketing campaigns and promotional offers</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Promotion</span>
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Active Promotions</h2>
        <p className="text-gray-600">Promotion management features will be implemented here.</p>
      </Card>
    </div>
  );
};

export default Promotions;