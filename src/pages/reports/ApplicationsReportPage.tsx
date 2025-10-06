import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getApplicationsReport } from "@/lib/api/reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ApplicationsReportPage = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAuditTrail, setSelectedAuditTrail] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["applications-report", year, statusFilter],
    queryFn: () =>
      getApplicationsReport({
        year,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text(`Applications Report ${year}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Application ID", "Applicant", "Type", "Status", "Submitted", "Reviewed By", "Processing Days"]],
      body: (data?.applications || []).map((app: any) => [
        app.application_id,
        app.jsonb_data?.personalInformation?.firstName + " " + app.jsonb_data?.personalInformation?.lastName || "N/A",
        app.application_type,
        app.status,
        format(new Date(app.submission_date), "PP"),
        app.reviewed_by_name || "N/A",
        app.processing_days?.toString() || "In Progress",
      ]),
    });

    doc.save(`applications-report-${year}.pdf`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.applications || []).map((app: any) => ({
        "Application ID": app.application_id,
        "Applicant Name":
          app.jsonb_data?.personalInformation?.firstName + " " + app.jsonb_data?.personalInformation?.lastName || "N/A",
        "Application Type": app.application_type,
        "Submitted By": app.submitted_by || "N/A",
        "Submission Date": format(new Date(app.submission_date), "PPP"),
        Status: app.status,
        "Reviewed By": app.reviewed_by_name || "N/A",
        "Reviewed Date": app.reviewed_at ? format(new Date(app.reviewed_at), "PPP") : "N/A",
        "Approved/Declined By": app.approved_by_name || app.declined_by_name || "N/A",
        "Final Decision Date": app.approved_at
          ? format(new Date(app.approved_at), "PPP")
          : app.declined_at
          ? format(new Date(app.declined_at), "PPP")
          : "N/A",
        "Processing Days": app.processing_days || "In Progress",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, `applications-report-${year}.xlsx`);
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

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

      <h1 className="text-2xl font-bold">Applications Report</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold">{data?.summary.total || 0}</p>
            </div>
            <FileText className="w-10 h-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold text-green-600">{data?.summary.approved || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Declined</p>
              <p className="text-3xl font-bold text-red-600">{data?.summary.declined || 0}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Processing Time</p>
              <p className="text-3xl font-bold">{data?.summary.avg_processing_days?.toFixed(0) || 0} days</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium mr-2">Year:</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mr-2">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewed By</TableHead>
              <TableHead>Processing Days</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (data?.applications || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              (data?.applications || []).map((app: any) => (
                <TableRow key={app.application_id}>
                  <TableCell className="font-medium">{app.application_id}</TableCell>
                  <TableCell>
                    {app.jsonb_data?.personalInformation?.firstName} {app.jsonb_data?.personalInformation?.lastName}
                  </TableCell>
                  <TableCell className="capitalize">{app.application_type?.replace("_", " ")}</TableCell>
                  <TableCell>{format(new Date(app.submission_date), "PP")}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        app.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : app.status === "declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </TableCell>
                  <TableCell>{app.reviewed_by_name || "N/A"}</TableCell>
                  <TableCell>{app.processing_days ? `${app.processing_days} days` : "In Progress"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAuditTrail(app.application_audit_trail)}
                      disabled={!app.application_audit_trail || app.application_audit_trail.length === 0}
                    >
                      View Audit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Audit Trail Dialog */}
      <Dialog open={!!selectedAuditTrail} onOpenChange={() => setSelectedAuditTrail(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Audit Trail</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAuditTrail?.map((audit: any) => (
              <Card key={audit.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-lg capitalize">{audit.action_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {audit.performed_by_name} ({audit.performed_by_role})
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{format(new Date(audit.created_at), "PPp")}</p>
                </div>

                {audit.previous_status && audit.new_status && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded">{audit.previous_status}</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-blue-100 rounded">{audit.new_status}</span>
                  </div>
                )}

                {audit.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <strong>Notes:</strong> {audit.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsReportPage;
