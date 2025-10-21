import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"

export default function DepositReportPage() {
  return (
    <ReportLayout title="Deposit Report" description="Monitor financial deposits and transactions across accounts">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700">Total Deposits</h3>
            <p className="text-3xl font-bold mt-2">₦ 18,456,780</p>
            <p className="text-sm text-green-600 mt-1">+4.5% from last month</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700">This Month</h3>
            <p className="text-3xl font-bold mt-2">₦ 3,245,600</p>
            <p className="text-sm text-blue-600 mt-1">28 transactions</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-700">Average</h3>
            <p className="text-3xl font-bold mt-2">₦ 658,456</p>
            <p className="text-sm text-purple-600 mt-1">Per month</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Monthly Deposit Trend</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Deposits by Account</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Deposits by Source</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Deposit Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Account</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Source</th>
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
                      <td className="px-4 py-3 text-sm">Government Allocation</td>
                      <td className="px-4 py-3 text-sm">₦ 2,345,680</td>
                      <td className="px-4 py-3 text-sm">2023-05-05</td>
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
