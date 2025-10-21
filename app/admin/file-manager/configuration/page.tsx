import { FileConfiguration } from "./file-configuration"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "File Configuration | IPPIS Admin",
  description: "Configure file management settings",
}

export default function FileConfigurationPage() {
  return <FileConfiguration />
}
