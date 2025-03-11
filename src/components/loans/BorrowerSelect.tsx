
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Borrower {
  borrower_id: string;
  given_name: string;
  surname: string;
  email: string;
}

interface BorrowerSelectProps {
  name: string;
}

const BorrowerSelect = ({ name }: BorrowerSelectProps) => {
  const [open, setOpen] = useState(false);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useFormContext();

  // Fetch borrowers on component mount.
  useEffect(() => {
    const fetchBorrowers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("borrowers")
          .select("borrower_id, given_name, surname, email");
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

  // Filter borrowers based on the search term.
  const filteredBorrowers = borrowers.filter((borrower) =>
    `${borrower.given_name} ${borrower.surname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    borrower.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <FormItem className="flex flex-col">
      <FormLabel className="text-base">Borrower</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between h-12 w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading borrowers..."
                : form.watch(name)
                ? (() => {
                    const selected = borrowers.find(
                      (borrower) => borrower.borrower_id === form.watch(name)
                    );
                    return selected
                      ? `${selected.given_name} ${selected.surname}`
                      : "Select borrower";
                  })()
                : "Select borrower"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search borrower..."
              onValueChange={setSearchTerm}
              className="h-10"
            />
            {isLoading ? (
              <div className="py-6 text-center text-sm">Loading borrowers...</div>
            ) : (
              <>
                <CommandEmpty>No borrower found.</CommandEmpty>
                <CommandGroup className="max-h-72 overflow-auto">
                  {filteredBorrowers.map((borrower) => (
                    <CommandItem
                      key={borrower.borrower_id}
                      value={`${borrower.given_name} ${borrower.surname}`}
                      onSelect={() => {
                        form.setValue(name, borrower.borrower_id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          borrower.borrower_id === form.watch(name)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {borrower.given_name} {borrower.surname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {borrower.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

export default BorrowerSelect;
