import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"

export default function TransactionReportPage() {
  return (
    <ReportLayout title="Transaction Report" description="View detailed financial transaction history and analysis">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700">Total Transactions</h3>
            <p className="text-3xl font-bold mt-2">1,248</p>
            <p className="text-sm text-blue-600 mt-1">Last 30 days</p>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700">Deposits</h3>
            <p className="text-3xl font-bold mt-2">₦ 24,568,920</p>
            <p className="text-sm text-green-600 mt-1">+5.8% from last month</p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-700">Withdrawals</h3>
            <p className="text-3xl font-bold mt-2">₦ 18,765,430</p>
            <p className="text-sm text-red-600 mt-1">+2.3% from last month</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-700">Net Flow</h3>
            <p className="text-3xl font-bold mt-2">₦ 5,803,490</p>
            <p className="text-sm text-purple-600 mt-1">Positive balance</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Transaction Volume</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Transaction Types</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Transaction by Account</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Transaction Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Account</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">TRX-{100245 + i}</td>
                      <td className="px-4 py-3 text-sm">IPPIS Operational Account</td>
                      <td className="px-4 py-3 text-sm">{i % 2 === 0 ? "Deposit" : "Withdrawal"}</td>
                      <td className="px-4 py-3 text-sm">₦ {i % 2 === 0 ? "2,345,680" : "1,876,540"}</td>
                      <td className="px-4 py-3 text-sm">2023-05-{10 + i}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportLayout>
  )
}
