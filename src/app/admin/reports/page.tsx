"use client";

import { useEffect, useState } from "react";
import { Flag, CheckCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Report, UserProfile } from "@/types/database";

interface ReportWithUsers extends Report {
  reporter?: UserProfile;
  reported?: UserProfile;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportWithUsers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      const reportList = (data as Report[]) || [];
      const enriched: ReportWithUsers[] = [];

      for (const r of reportList) {
        const { data: reporter } = await supabase
          .from("users")
          .select("*")
          .eq("id", r.reporter_id)
          .single();
        const { data: reported } = await supabase
          .from("users")
          .select("*")
          .eq("id", r.reported_id)
          .single();

        enriched.push({
          ...r,
          reporter: (reporter as UserProfile) || undefined,
          reported: (reported as UserProfile) || undefined,
        });
      }

      setReports(enriched);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(
    reportId: string,
    status: "reviewed" | "resolved"
  ) {
    const supabase = createClient();
    const { error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
    toast.success(`Report marked as ${status}`);
  }

  async function deactivateUser(userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", userId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User deactivated");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    reviewed: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Reports</h2>
        <p className="text-muted-foreground">
          {reports.filter((r) => r.status === "pending").length} pending reports
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Flag className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No reports yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                    {report.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-3">
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    Reported by
                  </p>
                  <p className="font-medium">
                    {report.reporter?.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.reporter?.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    Reported user
                  </p>
                  <p className="font-medium">
                    {report.reported?.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.reported?.email}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Reason: {report.reason}</p>
                {report.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {report.description}
                  </p>
                )}
              </div>

              {report.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(report.id, "reviewed")}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Mark Reviewed
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatus(report.id, "resolved")}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                  {report.reported && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deactivateUser(report.reported!.id)}
                    >
                      Deactivate User
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
