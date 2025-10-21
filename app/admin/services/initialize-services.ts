import { MockDataService } from "./mock-data-service"
import { PendingEmployeeService } from "./pending-employee-service"

export async function initializeServices() {
  try {
    // Initialize mock data
    const mockData = await MockDataService.generateMockData()

    // Initialize services with mock data
    PendingEmployeeService.initialize(mockData.pendingEmployees)

    // No need to initialize DocumentService as it now uses real API calls

    console.log("Services initialized successfully")
    return true
  } catch (error) {
    console.error("Failed to initialize services:", error)
    return false
  }
}
