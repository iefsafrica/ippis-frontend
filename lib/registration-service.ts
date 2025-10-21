/**
 * Service for handling registration data
 */

// In-memory storage for demo purposes
// In a real application, this would be a database
const registrations = []

// Function to save registration data
export async function saveRegistrationData(data: any): Promise<{ id: string }> {
  // In a real application, this would save to a database
  // For demo purposes, we'll save to our in-memory storage

  // Generate a unique ID
  const id = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Add metadata
  const registrationData = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "pending_approval",
    currentStep: "submitted",
    comments: [],
  }

  // Save to our in-memory storage
  registrations.push(registrationData)

  // In a real application, we would send a confirmation email
  // await sendConfirmationEmail(registrationData);

  return { id }
}

// Function to get registration status
export async function getRegistrationStatus(registrationId: string): Promise<any> {
  // In a real application, this would query a database
  // For demo purposes, we'll search our in-memory storage

  const registration = registrations.find((reg) => reg.registrationId === registrationId)

  if (!registration) {
    return null
  }

  return {
    status: registration.status,
    submissionDate: registration.createdAt,
    lastUpdated: registration.updatedAt,
    currentStep: registration.currentStep,
    comments: registration.comments,
  }
}

// Function to update registration status
export async function updateRegistrationStatus(
  registrationId: string,
  status: string,
  comment?: string,
): Promise<boolean> {
  // In a real application, this would update a database record
  // For demo purposes, we'll update our in-memory storage

  const registrationIndex = registrations.findIndex((reg) => reg.registrationId === registrationId)

  if (registrationIndex === -1) {
    return false
  }

  // Update the registration
  registrations[registrationIndex] = {
    ...registrations[registrationIndex],
    status,
    updatedAt: new Date().toISOString(),
  }

  // Add comment if provided
  if (comment) {
    registrations[registrationIndex].comments.push({
      text: comment,
      timestamp: new Date().toISOString(),
    })
  }

  return true
}

// Function to get all registrations (for admin dashboard)
export async function getAllRegistrations(): Promise<any[]> {
  // In a real application, this would query a database
  // For demo purposes, we'll return our in-memory storage

  return registrations.map((reg) => ({
    id: reg.id,
    registrationId: reg.registrationId,
    name: `${reg.title} ${reg.firstName} ${reg.surname}`,
    email: reg.email,
    department: reg.department,
    status: reg.status,
    submissionDate: reg.createdAt,
  }))
}
