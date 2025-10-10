
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Printer, X } from "lucide-react";

interface Loan {
  id: string;
  amount: number;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'repaid';
}

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  organization: string;
  monthlyIncome: number;
  activeLoanId: string | null;
  // Additional fields from the borrowers table
  givenName?: string;
  surname?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber?: string;
  village?: string;
  district?: string;
  province?: string;
  nationality?: string;
  departmentCompany?: string;
  fileNumber?: string;
  position?: string;
  postalAddress?: string;
  workPhoneNumber?: string;
  fax?: string;
  dateEmployed?: string;
  paymaster?: string;
  lot?: string;
  section?: string;
  suburb?: string;
  streetName?: string;
  maritalStatus?: string;
  spouseLastName?: string;
  spouseFirstName?: string;
  spouseEmployerName?: string;
  spouseContactDetails?: string;
  employerBranch?: string;
  bank?: string;
  bankBranch?: string;
  bsbCode?: string;
  accountName?: string;
  accountNumber?: string;
  accountType?: string;
  clientType?: string;
  branchName?: string;
}

interface BorrowerDetailsProps {
  borrower: Borrower;
  loanHistory: Loan[];
  onClose: () => void;
  onPrint: () => void;
  onEmail: () => void;
}

const BorrowerDetails = ({
  borrower,
  loanHistory,
  onClose,
  onPrint,
  onEmail,
}: BorrowerDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={onPrint}>
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onEmail}>
          <Mail className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[60vh]">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID</Label>
              <div className="mt-1">{borrower.id}</div>
            </div>
            <div>
              <Label>Name</Label>
              <div className="mt-1">{borrower.name}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="mt-1">{borrower.email}</div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="mt-1">{borrower.phone || "Not provided"}</div>
            </div>
            <div>
              <Label>Gender</Label>
              <div className="mt-1">{borrower.gender || "Not provided"}</div>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <div className="mt-1">{borrower.dateOfBirth || "Not provided"}</div>
            </div>
            <div>
              <Label>Nationality</Label>
              <div className="mt-1">{borrower.nationality || "Not provided"}</div>
            </div>
            <div>
              <Label>Marital Status</Label>
              <div className="mt-1">{borrower.maritalStatus || "Not provided"}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Address Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Postal Address</Label>
              <div className="mt-1">{borrower.postalAddress || "Not provided"}</div>
            </div>
            <div>
              <Label>Street Address</Label>
              <div className="mt-1">{borrower.address || "Not provided"}</div>
            </div>
            <div>
              <Label>Lot</Label>
              <div className="mt-1">{borrower.lot || "Not provided"}</div>
            </div>
            <div>
              <Label>Section</Label>
              <div className="mt-1">{borrower.section || "Not provided"}</div>
            </div>
            <div>
              <Label>Suburb</Label>
              <div className="mt-1">{borrower.suburb || "Not provided"}</div>
            </div>
            <div>
              <Label>Street Name</Label>
              <div className="mt-1">{borrower.streetName || "Not provided"}</div>
            </div>
            <div>
              <Label>Village</Label>
              <div className="mt-1">{borrower.village || "Not provided"}</div>
            </div>
            <div>
              <Label>District</Label>
              <div className="mt-1">{borrower.district || "Not provided"}</div>
            </div>
            <div>
              <Label>Province</Label>
              <div className="mt-1">{borrower.province || "Not provided"}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Employment Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Occupation</Label>
              <div className="mt-1">{borrower.occupation || "Not provided"}</div>
            </div>
            <div>
              <Label>Organization</Label>
              <div className="mt-1">{borrower.organization || "Not provided"}</div>
            </div>
            <div>
              <Label>Position</Label>
              <div className="mt-1">{borrower.position || "Not provided"}</div>
            </div>
            <div>
              <Label>Department/Company</Label>
              <div className="mt-1">{borrower.departmentCompany || "Not provided"}</div>
            </div>
            <div>
              <Label>File Number</Label>
              <div className="mt-1">{borrower.fileNumber || "Not provided"}</div>
            </div>
            <div>
              <Label>Date Employed</Label>
              <div className="mt-1">{borrower.dateEmployed || "Not provided"}</div>
            </div>
            <div>
              <Label>Work Phone</Label>
              <div className="mt-1">{borrower.workPhoneNumber || "Not provided"}</div>
            </div>
            <div>
              <Label>Fax</Label>
              <div className="mt-1">{borrower.fax || "Not provided"}</div>
            </div>
            <div>
              <Label>Paymaster</Label>
              <div className="mt-1">{borrower.paymaster || "Not provided"}</div>
            </div>
            <div>
              <Label>Sales Office / Branch</Label>
              <div className="mt-1">{borrower.branchName || "Not provided"}</div>
            </div>
            <div>
              <Label>Client Type</Label>
              <div className="mt-1">{borrower.clientType || "Not provided"}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Spouse Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Spouse First Name</Label>
              <div className="mt-1">{borrower.spouseFirstName || "Not provided"}</div>
            </div>
            <div>
              <Label>Spouse Last Name</Label>
              <div className="mt-1">{borrower.spouseLastName || "Not provided"}</div>
            </div>
            <div>
              <Label>Spouse Employer</Label>
              <div className="mt-1">{borrower.spouseEmployerName || "Not provided"}</div>
            </div>
            <div>
              <Label>Spouse Contact Details</Label>
              <div className="mt-1">{borrower.spouseContactDetails || "Not provided"}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Banking Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bank</Label>
              <div className="mt-1">{borrower.bank || "Not provided"}</div>
            </div>
            <div>
              <Label>Bank Branch</Label>
              <div className="mt-1">{borrower.bankBranch || "Not provided"}</div>
            </div>
            <div>
              <Label>BSB Code</Label>
              <div className="mt-1">{borrower.bsbCode || "Not provided"}</div>
            </div>
            <div>
              <Label>Account Name</Label>
              <div className="mt-1">{borrower.accountName || "Not provided"}</div>
            </div>
            <div>
              <Label>Account Number</Label>
              <div className="mt-1">{borrower.accountNumber || "Not provided"}</div>
            </div>
            <div>
              <Label>Account Type</Label>
              <div className="mt-1">{borrower.accountType || "Not provided"}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Loan Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Monthly Income</Label>
              <div className="mt-1">${borrower.monthlyIncome?.toLocaleString() || "Not provided"}</div>
            </div>
            <div>
              <Label>Active Loan ID</Label>
              <div className="mt-1">{borrower.activeLoanId || 'No active loan'}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Loan History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanHistory.length > 0 ? (
                loanHistory.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.id}</TableCell>
                    <TableCell>${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {loan.endDate ? new Date(loan.endDate).toLocaleDateString() : 'Active'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No loan history available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDetails;
