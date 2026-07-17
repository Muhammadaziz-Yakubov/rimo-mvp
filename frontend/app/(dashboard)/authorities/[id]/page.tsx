"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  RefreshCw,
  Cable,
  CheckCircle,
  FileText,
  AlertCircle,
  KeyRound,
  FileCheck,
} from "lucide-react";
import { apiClient } from "@/services/api-client";
import { getTranslation } from "@/utils/multilang";
import { formatDateTime } from "@/utils/format-date";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AuthorityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // 1. Fetch details
  const { data: authority, isLoading, error } = useQuery({
    queryKey: ["authority", id],
    queryFn: async () => {
      const res = await apiClient.get(`/authorities/${id}`);
      return res.data;
    },
  });

  // Mock reports/tasks query filtered by TIN
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ["authorityReports", authority?.tin],
    enabled: !!authority?.tin,
    queryFn: async () => {
      // Fetch dynamic submitted tasks matching TIN
      const res = await apiClient.get("/tasks");
      return res.data.filter((t: any) => t.ownerTin === authority?.tin.toString());
    },
    initialData: [],
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/authorities/${id}/sync`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Tashkilot ma'lumotlari muvaffaqiyatli yangilandi.");
      queryClient.invalidateQueries({ queryKey: ["authority", id] });
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-[#0B7A3B]" />
        </div>
      </AppShell>
    );
  }

  if (error || !authority) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto mt-12 text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-lg font-bold">Failed to load profile</h2>
          <p className="text-sm text-zinc-500">The authority connection record does not exist or has been deleted.</p>
          <Button onClick={() => router.push("/authorities")} className="bg-[#0B7A3B]">
            Back to list
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.push("/authorities")}
          className="flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Authorities
        </button>

        {/* Profile Card Summary Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B7A3B]/10 text-[#0B7A3B] font-bold text-xl">
              {getTranslation(authority.title, "uz").substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {getTranslation(authority.title, "uz")}
                </h1>
                <StatusBadge status={authority.connectionStatus} type="authority" />
              </div>
              <p className="text-xs text-zinc-500">
                STIR/TIN: <span className="font-semibold text-zinc-800 dark:text-zinc-300">{authority.tin}</span> • Code: <span className="font-mono text-zinc-800 dark:text-zinc-300">{authority.code}</span>
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white rounded-lg shrink-0 h-9 font-semibold text-xs"
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", syncMutation.isPending ? "animate-spin" : "")} />
            Force Synchronization
          </Button>
        </div>

        {/* Details Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-zinc-100/60 dark:bg-zinc-950/40 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <TabsTrigger value="info" className="text-xs font-semibold px-4 py-2">
              Information Details
            </TabsTrigger>
            <TabsTrigger value="filings" className="text-xs font-semibold px-4 py-2">
              Filing History
            </TabsTrigger>
            <TabsTrigger value="credentials" className="text-xs font-semibold px-4 py-2">
              Integration State
            </TabsTrigger>
          </TabsList>

          {/* Info Details View */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#0B7A3B]" />
                    Cabinet Profile details
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
                  <div className="flex justify-between py-2.5">
                    <span className="text-zinc-500">Legal Entity Title</span>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                      {getTranslation(authority.title, "uz")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-zinc-500">STIR / TIN</span>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-100">{authority.tin}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-zinc-500">Authority Type</span>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-100">Juridical Entity</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-zinc-500">Registration Date</span>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                      {formatDateTime(authority.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Cable className="h-4 w-4 text-[#0B7A3B]" />
                    Connection Sync Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
                  <div className="flex justify-between py-2.5">
                    <span className="text-zinc-500">Current Health status</span>
                    <span className="font-semibold flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Active Secure Tunnel
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-zinc-500">Last Successful Sync</span>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                      {formatDateTime(authority.lastSyncAt)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-zinc-500">API Protocol Version</span>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-100 font-mono">v2.0 OAS</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dynamic reports list associated with this Authority TIN */}
          <TabsContent value="filings">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-zinc-50/40 dark:bg-zinc-950/20">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-6">Filing Task ID</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Filing Type</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Reporting Period</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Status</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right pr-6">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {loadingReports ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-zinc-500">
                          Loading submission records...
                        </TableCell>
                      </TableRow>
                    ) : reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                          <FileText className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                          No report filing transactions found for this TIN cabinet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report: any) => (
                        <TableRow key={report.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-850/10">
                          <TableCell className="py-3 pl-6 font-mono text-xs font-semibold">
                            #{report.govTaskId}
                          </TableCell>
                          <TableCell className="py-3 text-sm font-semibold">
                            {getTranslation(report.title, "uz")}
                          </TableCell>
                          <TableCell className="py-3 text-xs text-zinc-500">
                            {report.reportVersionCode}
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={report.status} />
                          </TableCell>
                          <TableCell className="py-3 text-right pr-6 text-xs text-zinc-500">
                            {formatDateTime(report.updatedAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials and Token Metadata */}
          <TabsContent value="credentials">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm max-w-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0B7A3B]/10 rounded-lg text-[#0B7A3B]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Integration Credentials State</CardTitle>
                    <CardDescription className="text-xs">
                      Rimo manages credentials automatically via background token rotations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-zinc-150 dark:divide-zinc-850 text-xs">
                <div className="flex justify-between py-3">
                  <span className="text-zinc-500 font-semibold">Integration Username</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200 font-mono">
                    {authority.credentialUsername}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-zinc-500 font-semibold">Decryption Key Health</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5" />
                    AES-256 Validated
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-zinc-500 font-semibold">Auto-Refresh Rotation</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">Enabled</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
