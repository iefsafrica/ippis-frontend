import { NextResponse } from "next/server"
import { Pool } from "pg"

type SettingsPayload = {
  emailNotifications: boolean
  systemNotifications: boolean
  documentVerificationMode: string
  systemName: string
  systemLogo: string
  systemTheme: string
  systemLanguage: string
  systemTimezone: string
  systemDateFormat: string
  systemTimeFormat: string
  systemCurrency: string
  systemDecimalSeparator: string
  systemThousandSeparator: string
}

type SettingField = {
  key: keyof SettingsPayload
  description: string
}

const DEFAULT_SETTINGS: SettingsPayload = {
  emailNotifications: true,
  systemNotifications: true,
  documentVerificationMode: "manual",
  systemName: "IPPIS Admin Portal",
  systemLogo: "",
  systemTheme: "light",
  systemLanguage: "en",
  systemTimezone: "Africa/Lagos",
  systemDateFormat: "DD/MM/YYYY",
  systemTimeFormat: "HH:mm",
  systemCurrency: "NGN",
  systemDecimalSeparator: ".",
  systemThousandSeparator: ",",
}

const SETTING_FIELDS: SettingField[] = [
  { key: "emailNotifications", description: "Enable email notifications" },
  { key: "systemNotifications", description: "Enable in-app system notifications" },
  { key: "documentVerificationMode", description: "Document verification workflow mode" },
  { key: "systemName", description: "Display name for the system" },
  { key: "systemLogo", description: "URL for the system logo" },
  { key: "systemTheme", description: "Preferred UI theme" },
  { key: "systemLanguage", description: "Preferred system language" },
  { key: "systemTimezone", description: "Default timezone" },
  { key: "systemDateFormat", description: "Default date format" },
  { key: "systemTimeFormat", description: "Default time format" },
  { key: "systemCurrency", description: "Default currency" },
  { key: "systemDecimalSeparator", description: "Decimal separator" },
  { key: "systemThousandSeparator", description: "Thousand separator" },
]

const SETTINGS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_by TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`

const connectionString = process.env.DATABASE_URL?.trim()
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  : null

const inMemorySettings = new Map<keyof SettingsPayload, string>()
let ensureSettingsTablePromise: Promise<void> | null = null

async function ensureSettingsTable() {
  if (!pool) {
    return
  }

  if (!ensureSettingsTablePromise) {
    ensureSettingsTablePromise = pool.query(SETTINGS_TABLE_SQL).then(() => undefined)
  }

  return ensureSettingsTablePromise
}

function isBooleanSetting(key: keyof SettingsPayload) {
  return key === "emailNotifications" || key === "systemNotifications"
}

function serializeSetting(key: keyof SettingsPayload, value: SettingsPayload[keyof SettingsPayload]) {
  if (isBooleanSetting(key)) {
    return value ? "true" : "false"
  }

  return String(value)
}

function parseSetting(key: keyof SettingsPayload, value: string) {
  if (isBooleanSetting(key)) {
    return value === "true"
  }

  return value
}

function toSettingsPayload(rows: Array<{ key: string; value: string }>) {
  const settings = { ...DEFAULT_SETTINGS } as SettingsPayload
  const mutableSettings = settings as Record<keyof SettingsPayload, string | boolean>

  for (const row of rows) {
    const field = row.key as keyof SettingsPayload
    if (field in settings) {
      mutableSettings[field] = parseSetting(field, row.value)
    }
  }

  return settings
}

async function readSettingRows() {
  if (!pool) {
    return SETTING_FIELDS.map((field) => {
      const storedValue = inMemorySettings.get(field.key)
      return {
        key: field.key,
        value: storedValue ?? serializeSetting(field.key, DEFAULT_SETTINGS[field.key]),
      }
    })
  }

  const result = await pool.query<{ key: string; value: string }>("SELECT key, value FROM settings")
  return result.rows
}

async function readSettings() {
  const rows = await readSettingRows()
  return toSettingsPayload(rows)
}

async function writeSettings(settings: SettingsPayload, updatedBy: string | null) {
  if (!pool) {
    for (const field of SETTING_FIELDS) {
      inMemorySettings.set(field.key, serializeSetting(field.key, settings[field.key]))
    }

    return
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    for (const field of SETTING_FIELDS) {
      const value = serializeSetting(field.key, settings[field.key])

      await client.query(
        `
          INSERT INTO settings (key, value, description, updated_by, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (key)
          DO UPDATE SET
            value = EXCLUDED.value,
            description = EXCLUDED.description,
            updated_by = EXCLUDED.updated_by,
            updated_at = NOW()
        `,
        [field.key, value, field.description, updatedBy],
      )
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export async function GET() {
  try {
    await ensureSettingsTable()

    const rows = await readSettingRows()

    if (rows.length === 0) {
      await writeSettings(DEFAULT_SETTINGS, "system")
      return NextResponse.json({
        success: true,
        data: DEFAULT_SETTINGS,
      })
    }

    return NextResponse.json({
      success: true,
      data: toSettingsPayload(rows),
    })
  } catch (error) {
    console.error("Error loading settings:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load settings",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    await ensureSettingsTable()

    const body = (await request.json()) as Partial<SettingsPayload> & { updatedBy?: string }
    const currentSettings = await readSettings()
    const mergedSettings: SettingsPayload = {
      emailNotifications: body.emailNotifications ?? currentSettings.emailNotifications ?? DEFAULT_SETTINGS.emailNotifications,
      systemNotifications: body.systemNotifications ?? currentSettings.systemNotifications ?? DEFAULT_SETTINGS.systemNotifications,
      documentVerificationMode:
        body.documentVerificationMode ?? currentSettings.documentVerificationMode ?? DEFAULT_SETTINGS.documentVerificationMode,
      systemName: body.systemName ?? currentSettings.systemName ?? DEFAULT_SETTINGS.systemName,
      systemLogo: body.systemLogo ?? currentSettings.systemLogo ?? DEFAULT_SETTINGS.systemLogo,
      systemTheme: body.systemTheme ?? currentSettings.systemTheme ?? DEFAULT_SETTINGS.systemTheme,
      systemLanguage: body.systemLanguage ?? currentSettings.systemLanguage ?? DEFAULT_SETTINGS.systemLanguage,
      systemTimezone: body.systemTimezone ?? currentSettings.systemTimezone ?? DEFAULT_SETTINGS.systemTimezone,
      systemDateFormat: body.systemDateFormat ?? currentSettings.systemDateFormat ?? DEFAULT_SETTINGS.systemDateFormat,
      systemTimeFormat: body.systemTimeFormat ?? currentSettings.systemTimeFormat ?? DEFAULT_SETTINGS.systemTimeFormat,
      systemCurrency: body.systemCurrency ?? currentSettings.systemCurrency ?? DEFAULT_SETTINGS.systemCurrency,
      systemDecimalSeparator:
        body.systemDecimalSeparator ?? currentSettings.systemDecimalSeparator ?? DEFAULT_SETTINGS.systemDecimalSeparator,
      systemThousandSeparator:
        body.systemThousandSeparator ?? currentSettings.systemThousandSeparator ?? DEFAULT_SETTINGS.systemThousandSeparator,
    }

    await writeSettings(mergedSettings, body.updatedBy ?? "admin")

    return NextResponse.json({
      success: true,
      data: mergedSettings,
    })
  } catch (error) {
    console.error("Error saving settings:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save settings",
      },
      { status: 500 },
    )
  }
}
