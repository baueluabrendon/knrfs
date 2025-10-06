import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail, TrendingUp, Eye, MousePointer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPromotionsReport } from "@/lib/api/reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const PromotionsReportPage = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["promotions-report"],
    queryFn: () => getPromotionsReport({}),
  });

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Promotions Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Campaign", "Status", "Sent Date", "Recipients", "Delivered", "Opened", "Clicked", "Delivery %", "Open %"]],
      body: (data?.campaigns || []).map((campaign: any) => [
        campaign.title,
        campaign.status,
        campaign.sent_at ? format(new Date(campaign.sent_at), "PP") : "Not sent",
        campaign.sent_count?.toString() || "0",
        campaign.delivered_count?.toString() || "0",
        campaign.opened_count?.toString() || "0",
        campaign.clicked_count?.toString() || "0",
        campaign.sent_count > 0
          ? `${((campaign.delivered_count / campaign.sent_count) * 100).toFixed(1)}%`
          : "0%",
        campaign.delivered_count > 0
          ? `${((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1)}%`
          : "0%",
      ]),
    });

    doc.save("promotions-report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.campaigns || []).map((campaign: any) => ({
        "Campaign ID": campaign.id,
        Title: campaign.title,
        Description: campaign.description || "N/A",
        Status: campaign.status,
        "Created Date": format(new Date(campaign.created_at), "PPP"),
        "Sent Date": campaign.sent_at ? format(new Date(campaign.sent_at), "PPP") : "Not sent",
        "Total Recipients": campaign.sent_count || 0,
        Delivered: campaign.delivered_count || 0,
        Opened: campaign.opened_count || 0,
        Clicked: campaign.clicked_count || 0,
        "Delivery Rate": campaign.sent_count > 0
          ? `${((campaign.delivered_count / campaign.sent_count) * 100).toFixed(1)}%`
          : "0%",
        "Open Rate": campaign.delivered_count > 0
          ? `${((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1)}%`
          : "0%",
        "Click Rate": campaign.opened_count > 0
          ? `${((campaign.clicked_count / campaign.opened_count) * 100).toFixed(1)}%`
          : "0%",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaigns");
    XLSX.writeFile(workbook, "promotions-report.xlsx");
  };

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

      <h1 className="text-2xl font-bold">Promotions Report</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
              <p className="text-3xl font-bold">{data?.summary.total_campaigns || 0}</p>
            </div>
            <Mail className="w-10 h-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emails Sent</p>
              <p className="text-3xl font-bold">{data?.summary.total_sent || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Delivery Rate</p>
            <p className="text-3xl font-bold text-green-600">{data?.summary.avg_delivery_rate?.toFixed(1) || 0}%</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Rate</p>
              <p className="text-3xl font-bold">{data?.summary.avg_open_rate?.toFixed(1) || 0}%</p>
            </div>
            <Eye className="w-10 h-10 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Click Rate</p>
              <p className="text-3xl font-bold">{data?.summary.avg_click_rate?.toFixed(1) || 0}%</p>
            </div>
            <MousePointer className="w-10 h-10 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead className="text-right">Recipients</TableHead>
              <TableHead className="text-right">Delivered</TableHead>
              <TableHead className="text-right">Opened</TableHead>
              <TableHead className="text-right">Clicked</TableHead>
              <TableHead className="text-right">Delivery %</TableHead>
              <TableHead className="text-right">Open %</TableHead>
              <TableHead className="text-right">Click %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (data?.campaigns || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  No campaigns found
                </TableCell>
              </TableRow>
            ) : (
              (data?.campaigns || []).map((campaign: any) => {
                const deliveryRate =
                  campaign.sent_count > 0 ? ((campaign.delivered_count / campaign.sent_count) * 100).toFixed(1) : 0;
                const openRate =
                  campaign.delivered_count > 0
                    ? ((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1)
                    : 0;
                const clickRate =
                  campaign.opened_count > 0 ? ((campaign.clicked_count / campaign.opened_count) * 100).toFixed(1) : 0;

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          campaign.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(campaign.created_at), "PP")}</TableCell>
                    <TableCell>{campaign.sent_at ? format(new Date(campaign.sent_at), "PP") : "Not sent"}</TableCell>
                    <TableCell className="text-right">{campaign.sent_count || 0}</TableCell>
                    <TableCell className="text-right">{campaign.delivered_count || 0}</TableCell>
                    <TableCell className="text-right">{campaign.opened_count || 0}</TableCell>
                    <TableCell className="text-right">{campaign.clicked_count || 0}</TableCell>
                    <TableCell className="text-right">{deliveryRate}%</TableCell>
                    <TableCell className="text-right">{openRate}%</TableCell>
                    <TableCell className="text-right">{clickRate}%</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PromotionsReportPage;
