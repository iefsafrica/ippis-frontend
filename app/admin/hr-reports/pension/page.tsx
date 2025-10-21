import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"

export default function PensionReportPage() {
  return (
    <ReportLayout title="Pension Report" description="Track pension contributions, distributions, and fund performance">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700">Total Contributions</h3>
            <p className="text-3xl font-bold mt-2">₦ 456,789,120</p>
            <p className="text-sm text-blue-600 mt-1">Year to date</p>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700">Employee Contributions</h3>
            <p className="text-3xl font-bold mt-2">₦ 182,715,648</p>
            <p className="text-sm text-green-600 mt-1">40% of total</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-700">Employer Contributions</h3>
            <p className="text-3xl font-bold mt-2">₦ 274,073,472</p>
            <p className="text-sm text-purple-600 mt-1">60% of total</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Monthly Contribution Trend</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Pension Fund Performance</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Contributions by Department</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Pension Contribution Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Employee ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">PFA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Employee Contribution</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Employer Contribution</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">EMP-{1000 + i}</td>
                      <td className="px-4 py-3 text-sm">John Doe</td>
                      <td className="px-4 py-3 text-sm">ARM Pension</td>
                      <td className="px-4 py-3 text-sm">₦ 45,680</td>
                      <td className="px-4 py-3 text-sm">₦ 68,520</td>
                      <td className="px-4 py-3 text-sm">₦ 114,200</td>
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
