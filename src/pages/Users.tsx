import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/authService";
import { useBorrowerSelect } from "@/hooks/useBorrowerSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserFormData {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  borrowerId?: string;
}

interface UserData {
  id: string;
  user_id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  status: string;
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    role: "",
    firstName: "",
    lastName: "",
  });
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the borrower selection hook
  const { borrowers, isLoading: borrowersLoading, getBorrowerNameById } = useBorrowerSelect();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      const transformedData = data.map((profile: any) => ({
        id: profile.user_id,
        user_id: profile.user_id,
        email: profile.email,
        role: profile.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
        created_at: profile.created_at,
        status: profile.is_password_changed ? "Active" : "Pending Setup"
      }));
      
      setUsers(transformedData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value, borrowerId: "" });
  };

  const handleBorrowerChange = (value: string) => {
    setFormData({ ...formData, borrowerId: value });
  };

  const resetForm = () => {
    setFormData({
      email: "",
      role: "",
      firstName: "",
      lastName: "",
      borrowerId: "",
    });
    setOpen(false);
  };

  const canAddRole = (role: string) => {
    if (!currentUser) return false;
    
    if (['administrator', 'super user'].includes(currentUser.role)) {
      return true;
    }
    
    if (currentUser.role === 'sales officer') {
      return role === 'client';
    }
    
    return false;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);

    try {
      if (!formData.email || !formData.role || !formData.firstName || !formData.lastName) {
        toast.error("Please fill in all required fields");
        setIsAddingUser(false);
        return;
      }
      
      if (formData.role === "client" && !formData.borrowerId) {
        toast.error("Please select a borrower for client users");
        setIsAddingUser(false);
        return;
      }
      
      if (!canAddRole(formData.role)) {
        toast.error("You don't have permission to add users with this role");
        setIsAddingUser(false);
        return;
      }
      
      const { user, error } = await authService.createUserWithAdmin(
        formData.email,
        "password123",
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          borrower_id: formData.role === "client" ? formData.borrowerId : null
        }
      );
      
      if (error) {
        toast.error("Admin operations require a server-side function. This feature needs to be updated.");
        console.error("Error creating user:", error);
        setIsAddingUser(false);
        return;
      }
      
      if (!user) {
        throw new Error("Failed to create user account");
      }
      
      toast.success(`User ${formData.email} created with default password`);
      
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: UserData) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsProcessing(true);
    
    try {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      });
      
      if (metadataError) {
        console.error("Metadata update error:", metadataError);
      }
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.firstName, 
          last_name: formData.lastName,
          role: formData.role
        })
        .eq('user_id', editingUser.user_id);
      
      if (profileError) throw profileError;
      
      toast.success("User profile updated successfully");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsProcessing(true);
    
    try {
      toast.error("User deletion requires admin privileges and must be done server-side.");
      console.error("User deletion requires admin privileges and should be done via an edge function");
      
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center bg-primary text-white rounded-md hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter first name" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter last name" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role *
                </Label>
                <Select onValueChange={handleRoleChange} value={formData.role}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="sales officer">Sales Officer</SelectItem>
                    <SelectItem value="accounts officer">Accounts Officer</SelectItem>
                    <SelectItem value="recoveries officer">Recoveries Officer</SelectItem>
                    <SelectItem value="administration officer">Administration Officer</SelectItem>
                    <SelectItem value="super user">Super User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Borrower Selection - Only show for client role */}
              {formData.role === "client" && (
                <div>
                  <Label htmlFor="borrower" className="text-sm font-medium text-gray-700">
                    Select Borrower *
                  </Label>
                  <Select onValueChange={handleBorrowerChange} value={formData.borrowerId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={borrowersLoading ? "Loading borrowers..." : "Select a borrower"} />
                    </SelectTrigger>
                    <SelectContent>
                      {borrowers.map((borrower) => (
                        <SelectItem key={borrower.borrower_id} value={borrower.borrower_id}>
                          {borrower.given_name} {borrower.surname} - {borrower.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.borrowerId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {getBorrowerNameById(formData.borrowerId)}
                    </p>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
                <p>User will be created with default password: <strong>password123</strong></p>
                <p>They will be prompted to change it on first login.</p>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isAddingUser}
                  className="w-full"
                >
                  {isAddingUser ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                        className="h-8 px-2"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName" className="text-sm font-medium text-gray-700">
                  First Name *
                </Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter first name" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editLastName" className="text-sm font-medium text-gray-700">
                  Last Name *
                </Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter last name" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="editRole" className="text-sm font-medium text-gray-700">
                Role *
              </Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="sales officer">Sales Officer</SelectItem>
                  <SelectItem value="accounts officer">Accounts Officer</SelectItem>
                  <SelectItem value="recoveries officer">Recoveries Officer</SelectItem>
                  <SelectItem value="administration officer">Administration Officer</SelectItem>
                  <SelectItem value="super user">Super User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
              >
                {isProcessing ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user {userToDelete?.first_name} {userToDelete?.last_name} ({userToDelete?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
