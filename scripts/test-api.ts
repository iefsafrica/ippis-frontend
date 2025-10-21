/**
 * Test script for API endpoints
 * Run with: npx tsx scripts/test-api.ts
 */
import fetch from "node-fetch"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"

async function testApiEndpoints() {
  console.log("Testing API endpoints...")
  console.log(`Using API base URL: ${API_BASE_URL}`)

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    const healthData = await healthResponse.json()
    console.log("Health check:", healthResponse.status, healthData)

    // Add more endpoint tests here

    console.log("All tests completed!")
  } catch (error) {
    console.error("Error testing API endpoints:", error)
  }
}

testApiEndpoints()
