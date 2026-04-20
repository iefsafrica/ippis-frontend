"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { useGetFinanceAccountAnalytics } from "@/services/hooks/finance/accounts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { FinanceCard } from "../components/finance-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ExportService from "@/app/admin/services/export-service"

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Printer,
  ChevronDown,
  Calendar,
  BarChart4,
  PieChart,
  LineChart,
} from "lucide-react"
import {
  CartesianGrid,
  Cell,
  Line,
  Bar,
  BarChart,
  LineChart as ReLineChart,
  Pie,
  PieChart as RePieChart,
  XAxis,
  YAxis,
  LabelList,
} from "recharts"

type AccountBalanceRow = {
  id: string
  accountName: string
  bankName: string
  currentBalance: number
  previousBalance: number
  change: number
  changePercentage: number
  currency: string
  lastUpdated: string
}

type AnalyticsTrendRow = {
  date: string
  balance: number
  previousBalance: number
  change: number
  percentChange: number
}

type AnalyticsDownloadRow = {
  Account: string
  Bank: string
  "Current Balance": number
  "Previous Balance": number
  Change: number
  "% Change": number
  "Last Updated": string
}

const normalizeAccountBalance = (account: any): AccountBalanceRow => ({
  id: String(account.id ?? account.account_id ?? account.accountId ?? `${account.accountName ?? account.account_name ?? "account"}-${account.bankName ?? account.bank_name ?? "bank"}`),
  accountName: account.accountName ?? account.account_name ?? "",
  bankName: account.bankName ?? account.bank_name ?? "",
  currentBalance: Number(account.currentBalance ?? account.current_balance ?? 0),
  previousBalance: Number(account.previousBalance ?? account.previous_balance ?? 0),
  change: Number(account.change ?? 0),
  changePercentage: Number(account.changePercentage ?? account.change_percentage ?? 0),
  currency: account.currency ?? "NGN",
  lastUpdated: account.lastUpdated ?? account.last_updated ?? account.updated_at ?? account.created_at ?? "",
})

const chartColors = ["#0f172a", "#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#7c3aed", "#0891b2", "#db2777"]

const sanitizeFilename = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")

export function AccountBalancesContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinanceAccountAnalytics()
  const [timeRange, setTimeRange] = useState("30days")
  const [chartType, setChartType] = useState("line")

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load account analytics")
    }
  }, [isError])

  const summary = data?.data?.summary
  const balances = (data?.data?.accountDetails ?? [])
    .map(normalizeAccountBalance)
    .sort((a, b) => {
      const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0
      const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0

      if (bTime !== aTime) return bTime - aTime
      return b.currentBalance - a.currentBalance
    })
  const trend = data?.data?.trend ?? []
  const chartData = useMemo<AnalyticsTrendRow[]>(() => {
    const normalizedTrend = trend
      .map((entry, index) => ({
        date: entry.label ?? entry.date ?? `Point ${index + 1}`,
        balance: Number(entry.balance ?? 0),
        previousBalance: Number(entry.previousBalance ?? 0),
        change: Number(entry.change ?? 0),
        percentChange: Number(entry.percentChange ?? 0),
      }))
      .filter((entry) => entry.date)

    if (normalizedTrend.length > 0) {
      return normalizedTrend
    }

    return balances.map((account) => ({
      date: account.accountName || account.bankName || account.id,
      balance: account.currentBalance,
      previousBalance: account.previousBalance,
      change: account.change,
      percentChange: account.changePercentage,
    }))
  }, [trend, balances])

  const pieData = useMemo(
    () =>
      balances.map((account, index) => ({
        name: account.accountName || account.bankName || account.id,
        value: account.currentBalance,
        fill: chartColors[index % chartColors.length],
      })),
    [balances],
  )

  const chartConfig = {
    balance: {
      label: "Current balance",
      color: "#2563eb",
    },
    previousBalance: {
      label: "Previous balance",
      color: "#94a3b8",
    },
    change: {
      label: "Change",
      color: "#16a34a",
    },
    percentChange: {
      label: "Percent change",
      color: "#7c3aed",
    },
  } as const

  const exportRows = useMemo<AnalyticsDownloadRow[]>(
    () =>
      balances.map((account) => ({
        Account: account.accountName,
        Bank: account.bankName,
        "Current Balance": account.currentBalance,
        "Previous Balance": account.previousBalance,
        Change: account.change,
        "% Change": account.changePercentage,
        "Last Updated": account.lastUpdated ? new Date(account.lastUpdated).toLocaleString() : "N/A",
      })),
    [balances],
  )

  const exportColumns = [
    { header: "Account", accessor: "Account" },
    { header: "Bank", accessor: "Bank" },
    { header: "Current Balance", accessor: "Current Balance" },
    { header: "Previous Balance", accessor: "Previous Balance" },
    { header: "Change", accessor: "Change" },
    { header: "% Change", accessor: "% Change" },
    { header: "Last Updated", accessor: "Last Updated" },
  ]

  const totalCurrentBalance =
    summary?.totalBalance ??
    balances.reduce((sum, account) => sum + (account.currency === "NGN" ? account.currentBalance : account.currentBalance * 1500), 0)

  const totalPreviousBalance =
    summary?.previousBalance ??
    balances.reduce((sum, account) => sum + (account.currency === "NGN" ? account.previousBalance : account.previousBalance * 1500), 0)

  const totalChange = summary?.change ?? totalCurrentBalance - totalPreviousBalance
  const totalChangePercentage =
    summary?.percentChange ?? (totalPreviousBalance ? (totalChange / totalPreviousBalance) * 100 : 0)

  const positiveChangeAccounts =
    summary?.increaseAccounts ?? balances.filter((account) => account.change > 0).length
  const negativeChangeAccounts =
    summary?.decreaseAccounts ?? balances.filter((account) => account.change < 0).length
  const totalAccounts = summary?.totalAccounts ?? balances.length

  const handleExportPDF = () => {
    ExportService.exportToPDF(exportRows, {
      title: "Account Balances Report",
      filename: `account_balances_${sanitizeFilename(getTimeRangeLabel()) || "report"}`,
      columns: exportColumns,
    })

    toast.success("PDF downloaded successfully")
  }

  const handleExportCSV = () => {
    ExportService.exportToCSV(exportRows, {
      title: "Account Balances",
      filename: `account_balances_${sanitizeFilename(getTimeRangeLabel()) || "report"}`,
      columns: exportColumns,
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7days":
        return "Last 7 Days"
      case "30days":
        return "Last 30 Days"
      case "90days":
        return "Last 90 Days"
      case "1year":
        return "Last Year"
      default:
        return "Last 30 Days"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Account Balances</h1>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble loading the account analytics.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceCard
          title="Total Balance"
          value={totalCurrentBalance}
          isCurrency
          currencySymbol="₦"
          icon={<Wallet className="h-4 w-4 text-gray-500" />}
          trend={totalChangePercentage}
          trendLabel="vs previous period"
          isLoading={isLoading || isFetching}
          className="bg-white"
        />
        <FinanceCard
          title="Accounts with Increase"
          value={positiveChangeAccounts}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          description={`${positiveChangeAccounts} of ${totalAccounts} accounts`}
          isLoading={isLoading || isFetching}
          className="bg-white"
        />
        <FinanceCard
          title="Accounts with Decrease"
          value={negativeChangeAccounts}
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          description={`${negativeChangeAccounts} of ${totalAccounts} accounts`}
          isLoading={isLoading || isFetching}
          className="bg-white"
        />
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Balance Trend - {getTimeRangeLabel()}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setChartType("line")}
            >
              <LineChart className="h-4 w-4" />
              <span className="sr-only">Line chart</span>
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setChartType("bar")}
            >
              <BarChart4 className="h-4 w-4" />
              <span className="sr-only">Bar chart</span>
            </Button>
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setChartType("pie")}
            >
              <PieChart className="h-4 w-4" />
              <span className="sr-only">Pie chart</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="h-[320px] w-full"
          >
            {chartType === "line" ? (
              <ReLineChart data={chartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-balance)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="previousBalance"
                  stroke="var(--color-previousBalance)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </ReLineChart>
            ) : chartType === "bar" ? (
              <BarChart data={chartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="balance" fill="var(--color-balance)" radius={6} />
                <Bar dataKey="change" fill="var(--color-change)" radius={6} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            ) : (
              <RePieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="name"
                    position="outside"
                    className="fill-muted-foreground text-xs"
                  />
                </Pie>
              </RePieChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Account Balance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
                <TableHead className="text-right">Previous Balance</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">% Change</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">
                    Loading account analytics...
                  </TableCell>
                </TableRow>
              ) : balances.length > 0 ? (
                balances.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.accountName}</TableCell>
                    <TableCell>{account.bankName}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(
                        account.currentBalance,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(
                        account.previousBalance,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          account.change > 0 ? "text-green-600" : account.change < 0 ? "text-red-600" : "text-gray-600"
                        }
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: account.currency,
                          signDisplay: "always",
                        }).format(account.change)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          account.changePercentage > 0
                            ? "text-green-600"
                            : account.changePercentage < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }
                      >
                        {account.changePercentage.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {account.lastUpdated ? new Date(account.lastUpdated).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }) : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">
                    No account analytics found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
