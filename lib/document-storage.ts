import { put } from "@vercel/blob"
import crypto from "crypto"

// Generate a unique filename
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString("hex")
  const extension = originalFilename.split(".").pop()
  return `${timestamp}-${randomString}.${extension}`
}

// Upload a file to Vercel Blob
export async function uploadFile(file: File, registrationId: string, fileType: string): Promise<string> {
  try {
    const uniqueFilename = generateUniqueFilename(file.name)
    const key = `${registrationId}/${fileType}/${uniqueFilename}`

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error(`File size exceeds the maximum allowed size of 5MB`)
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPG, PNG, and PDF files are allowed.")
    }

    const { url } = await put(key, file, {
      access: "public",
    })

    return url
  } catch (error) {
    console.error("Error uploading file to Vercel Blob:", error)
    throw error
  }
}

// Get a public URL for a file
export async function getFileUrl(key: string): Promise<string> {
  // Vercel Blob URLs are directly accessible, so we just return the key
  return key
}
