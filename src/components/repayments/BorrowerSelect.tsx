
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Borrower {
  borrower_id: string;
  given_name: string;
  surname: string;
}

interface BorrowerSelectProps {
  onBorrowerSelect: (borrowerId: string, borrowerName: string) => void;
}

const BorrowerSelect = ({ onBorrowerSelect }: BorrowerSelectProps) => {
  const [open, setOpen] = useState(false);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<string>("");
  const [selectedBorrowerName, setSelectedBorrowerName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBorrowers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("borrowers")
          .select("borrower_id, given_name, surname")
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

  const handleSelect = (borrowerId: string) => {
    const borrower = borrowers.find(b => b.borrower_id === borrowerId);
    if (borrower) {
      const fullName = `${borrower.given_name} ${borrower.surname}`;
      setSelectedBorrower(borrowerId);
      setSelectedBorrowerName(fullName);
      onBorrowerSelect(borrowerId, fullName);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading 
            ? "Loading borrowers..." 
            : selectedBorrowerName || "Select Borrower"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput placeholder="Search borrower..." />
          {isLoading ? (
            <div className="py-6 text-center text-sm">Loading borrowers...</div>
          ) : (
            <>
              <CommandEmpty>No borrower found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {borrowers.map((borrower) => (
                  <CommandItem
                    key={borrower.borrower_id}
                    value={`${borrower.given_name} ${borrower.surname}`}
                    onSelect={() => handleSelect(borrower.borrower_id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBorrower === borrower.borrower_id 
                          ? "opacity-100" 
                          : "opacity-0"
                      )}
                    />
                    <span>
                      {borrower.given_name} {borrower.surname}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BorrowerSelect;
