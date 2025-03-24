
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Borrower {
  borrower_id: string;
  given_name: string;
  surname: string;
  email: string;
}

export const useBorrowerSelect = () => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string | null>(null);

  // Fetch borrowers on hook initialization
  useEffect(() => {
    const fetchBorrowers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("borrowers")
          .select("borrower_id, given_name, surname, email")
          .order("surname", { ascending: true });

        if (error) {
          throw error;
        }
        
        setBorrowers(data || []);
      } catch (error) {
        console.error("Error fetching borrowers:", error);
        toast.error("Failed to load borrowers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBorrowers();
  }, []);

  // Helper function to get a borrower's full name by ID
  const getBorrowerNameById = (id: string): string => {
    const borrower = borrowers.find(b => b.borrower_id === id);
    return borrower ? `${borrower.given_name} ${borrower.surname}` : "";
  };

  // Find borrower ID by name (for lookups)
  const findBorrowerIdByName = (fullName: string): string | null => {
    const nameParts = fullName.trim().split(' ');
    let foundBorrower;
    
    if (nameParts.length >= 2) {
      // Try to match with first and last name
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      
      foundBorrower = borrowers.find(
        b => b.given_name.toLowerCase().includes(firstName.toLowerCase()) && 
             b.surname.toLowerCase().includes(lastName.toLowerCase())
      );
    } else {
      // Try to match with either first or last name
      foundBorrower = borrowers.find(
        b => b.given_name.toLowerCase().includes(fullName.toLowerCase()) || 
             b.surname.toLowerCase().includes(fullName.toLowerCase())
      );
    }
    
    return foundBorrower ? foundBorrower.borrower_id : null;
  };

  return {
    borrowers,
    isLoading,
    selectedBorrowerId,
    setSelectedBorrowerId,
    getBorrowerNameById,
    findBorrowerIdByName
  };
};
