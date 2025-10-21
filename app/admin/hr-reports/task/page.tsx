import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"

export default function TaskReportPage() {
  return (
    <ReportLayout title="Task Report" description="Analyze task completion rates, timelines, and employee performance">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700">Completed</h3>
            <p className="text-3xl font-bold mt-2">248</p>
            <p className="text-sm text-green-600 mt-1">+12% from last month</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700">In Progress</h3>
            <p className="text-3xl font-bold mt-2">87</p>
            <p className="text-sm text-blue-600 mt-1">-5% from last month</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-amber-700">Overdue</h3>
            <p className="text-3xl font-bold mt-2">23</p>
            <p className="text-sm text-amber-600 mt-1">-8% from last month</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-700">Not Started</h3>
            <p className="text-3xl font-bold mt-2">56</p>
            <p className="text-sm text-purple-600 mt-1">+3% from last month</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Task Completion Trend</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Task Distribution by Priority</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Task Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Task Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Assignee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Priority</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">Update employee database</td>
                      <td className="px-4 py-3 text-sm">John Doe</td>
                      <td className="px-4 py-3 text-sm">IPPIS System Upgrade</td>
                      <td className="px-4 py-3 text-sm">2023-05-30</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High</span>
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
