import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Power, PowerOff } from "lucide-react";
import { Branch } from "@/lib/api/branches";

interface BranchTableProps {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onToggleStatus: (branch: Branch) => void;
  isLoading?: boolean;
}

const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  onEdit,
  onToggleStatus,
  isLoading = false
}) => {
  const formatBranchType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getBranchTypeVariant = (type: string) => {
    switch (type) {
      case 'head_office': return 'default';
      case 'branch_office': return 'secondary';
      case 'service_center': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        Loading branches...
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No branches found. Create your first branch to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Manager</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {branches.map((branch) => (
          <TableRow key={branch.id}>
            <TableCell className="font-mono font-medium">
              {branch.branch_code}
            </TableCell>
            <TableCell className="font-medium">
              {branch.branch_name}
            </TableCell>
            <TableCell>
              <Badge variant={getBranchTypeVariant(branch.branch_type)}>
                {formatBranchType(branch.branch_type)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {branch.city && branch.state_province 
                  ? `${branch.city}, ${branch.state_province}`
                  : branch.city || branch.state_province || branch.address_line1 || 'No address'
                }
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {branch.manager_name ? (
                  <>
                    <div className="font-medium">{branch.manager_name}</div>
                    {branch.manager_contact && (
                      <div className="text-muted-foreground">{branch.manager_contact}</div>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">No manager assigned</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={branch.is_active ? "default" : "secondary"}>
                {branch.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(branch)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(branch)}
                  className={branch.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                >
                  {branch.is_active ? (
                    <PowerOff className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {branch.is_active ? "Deactivate" : "Activate"}
                  </span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BranchTable;