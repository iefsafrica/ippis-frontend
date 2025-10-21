import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"

export default function AccountReportPage() {
  return (
    <ReportLayout title="Account Report" description="Financial account summaries, balances, and transaction history">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700">Total Balance</h3>
            <p className="text-3xl font-bold mt-2">₦ 24,568,920</p>
            <p className="text-sm text-green-600 mt-1">+5.8% from last month</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700">Income</h3>
            <p className="text-3xl font-bold mt-2">₦ 8,245,600</p>
            <p className="text-sm text-blue-600 mt-1">+2.3% from last month</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-amber-700">Expenses</h3>
            <p className="text-3xl font-bold mt-2">₦ 6,789,450</p>
            <p className="text-sm text-amber-600 mt-1">-1.2% from last month</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Income vs Expenses</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Account Balances</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Monthly Cash Flow</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Account Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Account Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Account Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Balance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">IPPIS Operational Account</td>
                      <td className="px-4 py-3 text-sm">0123456789</td>
                      <td className="px-4 py-3 text-sm">First Bank</td>
                      <td className="px-4 py-3 text-sm">Current</td>
                      <td className="px-4 py-3 text-sm">₦ 12,345,678</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
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
