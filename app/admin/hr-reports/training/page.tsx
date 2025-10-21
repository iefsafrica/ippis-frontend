import { Briefcase, Users, Award, Book } from "lucide-react"

export default function TrainingReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-semibold">Training Report</h3>

        <div className="mt-4 sm:mt-0 flex space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Export</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Trainings</p>
              <p className="text-xl font-semibold">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Employees Trained</p>
              <p className="text-xl font-semibold">87</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Certifications</p>
              <p className="text-xl font-semibold">42</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full mr-3">
              <Book className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Training Hours</p>
              <p className="text-xl font-semibold">356</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-lg font-medium mb-4">Training Distribution</h4>
        <div className="h-64 bg-gray-50 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
          <div className="text-center">
            <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Training distribution chart will appear here</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium">Training Details</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Training Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Participants
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  End Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {
                        [
                          "Leadership Skills",
                          "Technical Writing",
                          "Project Management",
                          "Data Analysis",
                          "Communication Skills",
                        ][index]
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["All Departments", "IT", "Management", "Finance", "HR"][index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{[24, 12, 18, 15, 22][index]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["01 May 2023", "15 May 2023", "01 Jun 2023", "15 Jun 2023", "01 Jul 2023"][index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {["15 May 2023", "22 May 2023", "15 Jun 2023", "30 Jun 2023", "15 Jul 2023"][index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        index % 3 === 0
                          ? "bg-green-100 text-green-800"
                          : index % 3 === 1
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {index % 3 === 0 ? "Completed" : index % 3 === 1 ? "In Progress" : "Scheduled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">Showing 5 of 24 entries</div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
