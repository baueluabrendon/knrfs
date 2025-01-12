import { Label } from "@/components/ui/label";

interface Borrower {
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
}

export const BorrowerInformation = ({ borrower }: { borrower: Borrower }) => {
  return (
    <div className="rounded-lg border p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Borrower Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Borrower ID</Label>
          <div className="mt-1">{borrower.borrowerId}</div>
        </div>
        <div>
          <Label>Name</Label>
          <div className="mt-1">{borrower.borrowerName}</div>
        </div>
        <div>
          <Label>Email</Label>
          <div className="mt-1">{borrower.borrowerEmail}</div>
        </div>
        <div>
          <Label>Phone</Label>
          <div className="mt-1">{borrower.borrowerPhone}</div>
        </div>
      </div>
    </div>
  );
};