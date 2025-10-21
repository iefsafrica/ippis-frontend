import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"

export default function ProjectReportPage() {
  return (
    <ReportLayout title="Project Report" description="Monitor project progress, resource allocation, and timelines">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700">Completed</h3>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700">In Progress</h3>
            <p className="text-3xl font-bold mt-2">8</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-amber-700">On Hold</h3>
            <p className="text-3xl font-bold mt-2">3</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-700">Not Started</h3>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Project Status Overview</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Resource Allocation</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Project Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Progress</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">IPPIS System Upgrade</td>
                      <td className="px-4 py-3 text-sm">IT</td>
                      <td className="px-4 py-3 text-sm">2023-01-15</td>
                      <td className="px-4 py-3 text-sm">2023-06-30</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                        <span className="text-xs text-gray-500">75%</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>
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
