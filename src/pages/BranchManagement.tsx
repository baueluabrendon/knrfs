import React, { useState, useEffect } from "react";
import { Plus, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import BranchForm from "@/components/branches/BranchForm";
import BranchTable from "@/components/branches/BranchTable";
import {
  Branch,
  CreateBranchData,
  getBranches,
  createBranch,
  updateBranch,
  activateBranch,
  deactivateBranch,
  checkBranchCodeExists,
} from "@/lib/api/branches";

const BranchManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Filter branches based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBranches(branches);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = branches.filter(branch =>
        branch.branch_code.toLowerCase().includes(lowercaseSearch) ||
        branch.branch_name.toLowerCase().includes(lowercaseSearch) ||
        branch.branch_type.toLowerCase().includes(lowercaseSearch) ||
        (branch.city && branch.city.toLowerCase().includes(lowercaseSearch)) ||
        (branch.state_province && branch.state_province.toLowerCase().includes(lowercaseSearch)) ||
        (branch.manager_name && branch.manager_name.toLowerCase().includes(lowercaseSearch))
      );
      setFilteredBranches(filtered);
    }
  }, [searchTerm, branches]);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const data = await getBranches();
      setBranches(data);
      setFilteredBranches(data);
    } catch (error: any) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to fetch branches: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async (branchData: CreateBranchData) => {
    try {
      setIsSubmitting(true);
      
      // Check if branch code already exists
      const codeExists = await checkBranchCodeExists(branchData.branch_code);
      if (codeExists) {
        toast.error("Branch code already exists. Please use a different code.");
        return;
      }

      await createBranch(branchData);
      toast.success("Branch created successfully");
      setIsCreateDialogOpen(false);
      fetchBranches();
    } catch (error: any) {
      console.error("Error creating branch:", error);
      toast.error("Failed to create branch: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBranch = async (branchData: CreateBranchData) => {
    if (!editingBranch) return;

    try {
      setIsSubmitting(true);
      
      // Check if branch code already exists (excluding current branch)
      if (branchData.branch_code !== editingBranch.branch_code) {
        const codeExists = await checkBranchCodeExists(branchData.branch_code, editingBranch.id);
        if (codeExists) {
          toast.error("Branch code already exists. Please use a different code.");
          return;
        }
      }

      await updateBranch(editingBranch.id, branchData);
      toast.success("Branch updated successfully");
      setIsEditDialogOpen(false);
      setEditingBranch(null);
      fetchBranches();
    } catch (error: any) {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBranchStatus = async (branch: Branch) => {
    try {
      if (branch.is_active) {
        await deactivateBranch(branch.id);
        toast.success(`Branch ${branch.branch_name} deactivated`);
      } else {
        await activateBranch(branch.id);
        toast.success(`Branch ${branch.branch_name} activated`);
      }
      fetchBranches();
    } catch (error: any) {
      console.error("Error toggling branch status:", error);
      toast.error("Failed to update branch status: " + error.message);
    }
  };

  const handleEditClick = (branch: Branch) => {
    setEditingBranch(branch);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Branch Management</h1>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search branches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Branches Table */}
      <Card className="p-6">
        <BranchTable
          branches={filteredBranches}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleBranchStatus}
          isLoading={isLoading}
        />
      </Card>

      {/* Create Branch Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>
          <BranchForm
            onSubmit={handleCreateBranch}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          {editingBranch && (
            <BranchForm
              initialData={editingBranch}
              onSubmit={handleEditBranch}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingBranch(null);
              }}
              isLoading={isSubmitting}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchManagement;