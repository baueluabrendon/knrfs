import React from "react";
import { useLoanApplication } from "@/contexts/loan-application";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { CalendarDays } from "lucide-react";

export const ApplicationDetails = () => {
  const { formData } = useLoanApplication();
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Application Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="applicationDetails.branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Branch where application was submitted"
                  {...field}
                  value={formData?.applicationDetails?.branchId || field.value || ""}
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicationDetails.applicationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={formData?.applicationDetails?.applicationDate || field.value || ""}
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};