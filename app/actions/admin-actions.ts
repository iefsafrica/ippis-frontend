"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

export async function cleanupHelpTables() {
  try {
    const sql = neon(process.env.DATABASE_URL || "")

    // Drop tables if they exist
    await sql`
      DROP TABLE IF EXISTS support_responses;
      DROP TABLE IF EXISTS support_tickets;
      DROP TABLE IF EXISTS guide_downloads;
      DROP TABLE IF EXISTS guides;
      DROP TABLE IF EXISTS guide_categories;
      DROP TABLE IF EXISTS faq_categories;
      DROP TABLE IF EXISTS faqs;
      DROP TABLE IF EXISTS help_settings;
    `

    revalidatePath("/admin/settings")

    return {
      success: true,
      message: "Help database tables removed successfully",
    }
  } catch (error) {
    console.error("Error cleaning up help tables:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
