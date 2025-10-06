import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Users, Building, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBorrowersReport } from "@/lib/api/reports";
import { useState } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { CheckboxFilter, OrganizationFilter } from "@/components/reports/ReportFilters";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useBranches } from "@/hooks/useBranches";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BorrowersReport = () => {
  const navigate = useNavigate();
  const [expandedOrgs, setExpandedOrgs] = useState<Record<string, boolean>>({});
  
  // Filter states
  const [branchId, setBranchId] = useState<string>("");
  const [hasActiveLoans, setHasActiveLoans] = useState<boolean>(false);
  const [organizationName, setOrganizationName] = useState<string>("");

  const { data: branches } = useBranches();

  const { data, isLoading, error } = useQuery({
    queryKey: ["borrowers-report", branchId, hasActiveLoans, organizationName],
    queryFn: () => getBorrowersReport({ branchId, hasActiveLoans, organizationName }),
  });

  if (error) {
    toast.error("Failed to load borrowers report");
  }

  const toggleOrg = (org: string) => {
    setExpandedOrgs((prev) => ({
      ...prev,
      [org]: !prev[org],
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Borrowers Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);
    doc.text(`Total Borrowers: ${data?.summary.total || 0}`, 14, 36);

    let startY = 45;
    Object.entries(data?.grouped || {}).forEach(([org, borrowers]) => {
      doc.setFontSize(14);
      doc.text(`${org} (${borrowers.length} clients)`, 14, startY);
      startY += 5;

      autoTable(doc, {
        startY,
        head: [["Borrower ID", "Name", "Gender", "Email", "Total Loans", "Active Loans"]],
        body: borrowers.map((b: any) => [
          b.borrower_id,
          `${b.given_name} ${b.surname}`,
          b.gender || "N/A",
          b.email,
          b.total_loans?.toString() || "0",
          b.active_loans?.toString() || "0",
        ]),
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save("borrowers-report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.borrowers || []).map((b: any) => ({
        "Borrower ID": b.borrower_id,
        "Given Name": b.given_name,
        Surname: b.surname,
        Gender: b.gender || "N/A",
        Email: b.email,
        "Mobile Number": b.mobile_number || "N/A",
        "Department/Company": b.department_company || "N/A",
        "File Number": b.file_number || "N/A",
        "Client Type": b.client_type || "N/A",
        "Total Loans": b.total_loans || 0,
        "Active Loans": b.active_loans || 0,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Borrowers");
    XLSX.writeFile(workbook, "borrowers-report.xlsx");
  };

  const maleCount = data?.borrowers.filter((b: any) => b.gender?.toLowerCase() === "male").length || 0;
  const femaleCount = data?.borrowers.filter((b: any) => b.gender?.toLowerCase() === "female").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/reports")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </Button>

        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">Borrowers Reports</h1>

      {/* Filters Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Branch</label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Branches</SelectItem>
                {(branches || []).map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <OrganizationFilter value={organizationName} onChange={setOrganizationName} placeholder="Search by department/company" />
          <div className="flex items-center">
            <CheckboxFilter
              checked={hasActiveLoans}
              onChange={setHasActiveLoans}
              label="Show only borrowers with active loans"
            />
          </div>
        </div>
        {(branchId || hasActiveLoans || organizationName) && (
          <Button variant="ghost" size="sm" onClick={() => {
            setBranchId("");
            setHasActiveLoans(false);
            setOrganizationName("");
          }} className="mt-4">
            Clear Filters
          </Button>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Borrowers</p>
              <p className="text-3xl font-bold">{data?.summary.total || 0}</p>
            </div>
            <Users className="w-10 h-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Organizations</p>
              <p className="text-3xl font-bold">{data?.summary.by_organization.length || 0}</p>
            </div>
            <Building className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Male Borrowers</p>
            <p className="text-3xl font-bold">{maleCount}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Female Borrowers</p>
            <p className="text-3xl font-bold">{femaleCount}</p>
          </div>
        </Card>
      </div>

      {/* Grouped by Organization */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Borrowers by Organization</h2>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(data?.grouped || {}).map(([org, borrowers]: [string, any]) => (
              <div key={org} className="border rounded-lg">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center p-4 hover:bg-accent"
                  onClick={() => toggleOrg(org)}
                >
                  <div className="flex items-center gap-2">
                    {expandedOrgs[org] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    <Building className="w-5 h-5" />
                    <span className="font-semibold text-lg">{org}</span>
                    <span className="text-muted-foreground">({borrowers.length} clients)</span>
                  </div>
                </Button>

                {expandedOrgs[org] && (
                  <div className="p-4 border-t space-y-2">
                    {borrowers.map((borrower: any) => (
                      <div key={borrower.borrower_id} className="flex justify-between items-center p-3 bg-accent rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {borrower.given_name} {borrower.surname}
                            </p>
                            {borrower.branch_name && (
                              <Badge variant="outline">{borrower.branch_name}</Badge>
                            )}
                            {borrower.active_loans > 0 && (
                              <Badge className="bg-green-100 text-green-800">Active Client</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {borrower.borrower_id} • {borrower.email}
                          </p>
                          {borrower.file_number && (
                            <p className="text-xs text-muted-foreground">File: {borrower.file_number}</p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p>Total Loans: {borrower.total_loans || 0}</p>
                          <p className="text-green-600 font-semibold">Active: {borrower.active_loans || 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BorrowersReport;