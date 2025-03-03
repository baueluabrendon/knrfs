
import { useState } from "react";
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
import { UserPlus, Search } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

// Types for user form
interface UserFormData {
  name: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

// Temporary mock data - replace with actual data later
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Manager",
    status: "Active",
  },
];

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      firstName: "",
      lastName: "",
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);

    try {
      // Validate form data
      if (!formData.email || !formData.role || !formData.firstName || !formData.lastName) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      const role = formData.role.toLowerCase();
      
      if (role === 'client') {
        // For clients, we create a user without a password and send a verification email
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(formData.email, {
          data: {
            role: role,
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          redirectTo: `${window.location.origin}/set-password`,
        });
        
        if (error) throw error;
        
        toast.success(`Verification email sent to ${formData.email}`);
      } else {
        // For admin users, generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        
        const { data, error } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: role,
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        });
        
        if (error) throw error;
        
        toast.success(`User ${formData.email} created with temporary password: ${tempPassword}`);
      }
      
      // Close dialog and reset form
      resetForm();
      setIsAddingUser(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
        <Dialog>
          <DialogTrigger className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
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
                    <SelectItem value="sales_officer">Sales Officer</SelectItem>
                    <SelectItem value="accounts_officer">Accounts Officer</SelectItem>
                    <SelectItem value="recoveries_officer">Recoveries Officer</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Users;
