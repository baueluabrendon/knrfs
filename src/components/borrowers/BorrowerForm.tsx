import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Create a schema that matches the borrowers table fields
const borrowerFormSchema = z.object({
  given_name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postal_address: z.string().optional(),
  // Employment information
  department_company: z.string().optional(),
  position: z.string().optional(),
  date_employed: z.string().optional(),
  work_phone_number: z.string().optional(),
  file_number: z.string().optional(),
  paymaster: z.string().optional(),
  // Residential information
  lot: z.string().optional(),
  section: z.string().optional(),
  suburb: z.string().optional(),
  street_name: z.string().optional(),
  // Marital status
  marital_status: z.string().optional(),
  spouse_last_name: z.string().optional(),
  spouse_first_name: z.string().optional(),
  spouse_employer_name: z.string().optional(),
  spouse_contact_details: z.string().optional(),
  // Bank details
  bank: z.string().optional(),
  bank_branch: z.string().optional(),
  bsb_code: z.string().optional(),
  account_name: z.string().optional(),
  account_number: z.string().optional(),
  account_type: z.string().optional(),
});

export type BorrowerFormData = z.infer<typeof borrowerFormSchema>;

interface BorrowerFormProps {
  onSubmit: (data: BorrowerFormData) => void;
  onCancel?: () => void;
}

const BorrowerForm = ({ onSubmit, onCancel }: BorrowerFormProps) => {
  const form = useForm<BorrowerFormData>({
    resolver: zodResolver(borrowerFormSchema),
    defaultValues: {
      given_name: "",
      surname: "",
      email: "",
      mobile_number: "",
      date_of_birth: "",
      gender: "",
      nationality: "",
      village: "",
      district: "",
      province: "",
      postal_address: "",
      department_company: "",
      position: "",
      date_employed: "",
      work_phone_number: "",
      file_number: "",
      paymaster: "",
      lot: "",
      section: "",
      suburb: "",
      street_name: "",
      marital_status: "",
      spouse_last_name: "",
      spouse_first_name: "",
      spouse_employer_name: "",
      spouse_contact_details: "",
      bank: "",
      bank_branch: "",
      bsb_code: "",
      account_name: "",
      account_number: "",
      account_type: ""
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    form.reset();
  });
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            
            <FormField
              control={form.control}
              name="given_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postal_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Employment Information</h3>
            
            <FormField
              control={form.control}
              name="department_company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department/Company</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date_employed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Employed</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="work_phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <h3 className="text-lg font-medium mt-6">Address Information</h3>
            
            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};

export default BorrowerForm;
