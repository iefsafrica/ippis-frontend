"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

import { FinanceCard } from "../components/finance-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

import { format, subDays } from "date-fns"

export function AccountBalancesContent() {
  const [balances, setBalances] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("30days")
  const [chartType, setChartType] = useState("line")

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get("/api/accounts/balance")
        setBalances(response.data)
      } catch (error) {
        console.error("Error fetching balances", error)
        toast.error("Failed to load account balances")
      }
    }

    fetchBalances()
  }, [])

  const totalCurrentBalance = balances.reduce((sum, account) => {
    return sum + (account.currency === "NGN" ? account.currentBalance : account.currentBalance * 1500)
  }, 0)

  const totalPreviousBalance = balances.reduce((sum, account) => {
    return sum + (account.currency === "NGN" ? account.previousBalance : account.previousBalance * 1500)
  }, 0)

  const totalChange = totalCurrentBalance - totalPreviousBalance
  const totalChangePercentage = (totalChange / totalPreviousBalance) * 100

  const positiveChangeAccounts = balances.filter((account) => account.change > 0).length
  const negativeChangeAccounts = balances.filter((account) => account.change < 0).length

  const handleExportPDF = () => {
    console.log("Exporting to PDF")
    // Implement export logic
  }

  const handleExportCSV = () => {
    console.log("Exporting to CSV")
    // Implement export logic
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
              <Calendar className="h-4 w-4 mr-2" />
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
                Export to PDF
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinanceCard
          title="Total Balance"
          value={totalCurrentBalance}
          isCurrency={true}
          currencySymbol="₦"
          icon={<Wallet className="h-4 w-4 text-gray-500" />}
          trend={totalChangePercentage}
          trendLabel="vs previous period"
          className="bg-white"
        />
        <FinanceCard
          title="Accounts with Increase"
          value={positiveChangeAccounts}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          description={`${positiveChangeAccounts} of ${balances.length} accounts`}
          className="bg-white"
        />
        <FinanceCard
          title="Accounts with Decrease"
          value={negativeChangeAccounts}
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          description={`${negativeChangeAccounts} of ${balances.length} accounts`}
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
          <div className="h-[300px] w-full">
            <div className="flex items-center justify-center h-full border border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing balance trend over{" "}
                  {getTimeRangeLabel().toLowerCase()}
                </p>
                <p className="text-xs text-gray-400 mt-1">Chart visualization would be rendered here</p>
              </div>
            </div>
          </div>
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
              {balances.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.accountName}</TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(
                      account.currentBalance
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(
                      account.previousBalance
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        account.change > 0
                          ? "text-green-600"
                          : account.change < 0
                          ? "text-red-600"
                          : "text-gray-600"
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
                    {format(new Date(account.lastUpdated), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
