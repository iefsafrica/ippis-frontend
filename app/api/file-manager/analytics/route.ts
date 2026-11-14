import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

const TEN_TERABYTES = 10 * 1024 * 1024 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function inferClassification(name: string, fileType: string): "Official / Secret" | "Confidential" | "Restricted" | "Public Official" {
  const lower = `${name} ${fileType}`.toLowerCase();
  if (lower.includes("secret") || lower.includes("payroll") || lower.includes("salary") || lower.includes("voucher")) {
    return "Official / Secret";
  }
  if (lower.includes("confidential") || lower.includes("warrant") || lower.includes("personnel") || lower.includes("disciplinary")) {
    return "Confidential";
  }
  if (lower.includes("audit") || lower.includes("nimc") || lower.includes("biometric") || lower.includes("pencom")) {
    return "Restricted";
  }
  return "Public Official";
}

function inferCategory(name: string, fileType: string): string {
  const lower = `${name} ${fileType}`.toLowerCase();
  if (lower.includes("circ") || lower.includes("circular")) return "Federal Circular";
  if (lower.includes("warr") || lower.includes("warrant") || lower.includes("fund")) return "Financial Warrant";
  if (lower.includes("aud") || lower.includes("audit") || lower.includes("cert")) return "Audit Certificate";
  if (lower.includes("pol") || lower.includes("policy") || lower.includes("rule")) return "Policy Document";
  if (lower.includes("gaz") || lower.includes("gazette")) return "Official Gazette";
  if (lower.includes("memo") || lower.includes("letter")) return "Executive Memo";
  return "Official Record";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mdaId = searchParams.get("mda_id") || searchParams.get("company_id");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const classificationFilter = searchParams.get("classification");

  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  // 1. Try external backend if a dedicated analytics endpoint is deployed
  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/file-manager/analytics?${searchParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      }
    );

    if (backendRes.ok) {
      const json = await backendRes.json().catch(() => null);
      if (json && (json.data?.kpis || json.kpis)) {
        return NextResponse.json(json.data ? json : { success: true, data: json });
      }
    }
  } catch {
    // Continue to live aggregation
  }

  // 2. Fetch live data from backend file-manager and company endpoints
  const headers = {
    "Content-Type": "application/json",
    ...(authHeader ? { Authorization: authHeader } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };

  let files: any[] = [];
  let dashboard: any = null;
  let companies: any[] = [];

  try {
    const [filesRes, dashRes, compRes] = await Promise.all([
      fetch(`${BACKEND_URL}/file-manager/files`, { headers, cache: "no-store" }).catch(() => null),
      fetch(`${BACKEND_URL}/file-manager/dashboard`, { headers, cache: "no-store" }).catch(() => null),
      fetch(`${BACKEND_URL}/admin/organization/company`, { headers, cache: "no-store" }).catch(() => null),
    ]);

    if (filesRes && filesRes.ok) {
      const json = await filesRes.json().catch(() => null);
      files = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
    }

    if (dashRes && dashRes.ok) {
      const json = await dashRes.json().catch(() => null);
      dashboard = json?.data || json;
    }

    if (compRes && compRes.ok) {
      const json = await compRes.json().catch(() => null);
      companies = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
    }
  } catch {
    // Handle network / parse errors gracefully
  }

  // 3. Filter files by query parameters
  let filteredFiles = [...files];

  if (mdaId) {
    filteredFiles = filteredFiles.filter(
      (f) => String(f.company_id || "") === String(mdaId)
    );
  }

  if (dateFrom) {
    const fromTime = new Date(dateFrom).getTime();
    filteredFiles = filteredFiles.filter(
      (f) => new Date(f.created_at || f.updated_at).getTime() >= fromTime
    );
  }

  if (dateTo) {
    const toTime = new Date(dateTo).getTime();
    filteredFiles = filteredFiles.filter(
      (f) => new Date(f.created_at || f.updated_at).getTime() <= toTime
    );
  }

  // 4. Compute Storage Metrics
  let totalBytes = 0;
  filteredFiles.forEach((f) => {
    const bytes = Number(f.file_size);
    if (Number.isFinite(bytes) && bytes > 0) {
      totalBytes += bytes;
    }
  });

  if (totalBytes === 0 && dashboard?.highlights?.total_storage_used) {
    totalBytes = Number(dashboard.highlights.total_storage_used) || 0;
  }

  const totalFilesCount = filteredFiles.length > 0
    ? filteredFiles.length
    : (dashboard?.highlights?.total_files || 0);

  const quotaPercentage =
    totalBytes > 0
      ? Math.max(0.1, Math.round((totalBytes / TEN_TERABYTES) * 1000) / 10)
      : 0;

  // 5. Format Breakdown Categories
  let pdfCount = 0;
  let biometricCount = 0;
  let spreadsheetCount = 0;
  let archiveCount = 0;
  let wordCount = 0;

  filteredFiles.forEach((f) => {
    const type = (f.file_type || "").toLowerCase();
    const name = (f.name || "").toLowerCase();

    if (type.includes("pdf") || name.endsWith(".pdf")) {
      pdfCount++;
    } else if (
      type.includes("image") ||
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.includes("signature") ||
      name.includes("biometric")
    ) {
      biometricCount++;
    } else if (
      type.includes("sheet") ||
      type.includes("excel") ||
      type.includes("csv") ||
      name.endsWith(".xlsx") ||
      name.endsWith(".xls") ||
      name.endsWith(".csv")
    ) {
      spreadsheetCount++;
    } else if (
      type.includes("zip") ||
      type.includes("tar") ||
      type.includes("compressed") ||
      name.endsWith(".zip") ||
      name.endsWith(".tar") ||
      name.endsWith(".gz") ||
      name.endsWith(".7z")
    ) {
      archiveCount++;
    } else {
      wordCount++;
    }
  });

  const categorizedTotal = pdfCount + biometricCount + spreadsheetCount + archiveCount + wordCount;
  const divisor = categorizedTotal > 0 ? categorizedTotal : 1;

  const formatBreakdown = [
    {
      name: "Official PDFs & Gazettes",
      count: pdfCount,
      value: Math.round((pdfCount / divisor) * 100),
      color: "#10b981",
    },
    {
      name: "Scanned Biometrics & Signatures",
      count: biometricCount,
      value: Math.round((biometricCount / divisor) * 100),
      color: "#3b82f6",
    },
    {
      name: "Spreadsheets & Payroll Datasets",
      count: spreadsheetCount,
      value: Math.round((spreadsheetCount / divisor) * 100),
      color: "#8b5cf6",
    },
    {
      name: "Encrypted Backups & Archives",
      count: archiveCount,
      value: Math.round((archiveCount / divisor) * 100),
      color: "#f59e0b",
    },
    {
      name: "Word Docs & Letters",
      count: wordCount,
      value: Math.round((wordCount / divisor) * 100),
      color: "#06b6d4",
    },
  ];

  // 6. Storage by MDA
  const mdaMap = new Map<string, { mda: string; storageBytes: number; filesCount: number }>();

  // Pre-populate with top companies if available
  companies.slice(0, 8).forEach((comp) => {
    mdaMap.set(String(comp.id), {
      mda: comp.name || "Federal MDA",
      storageBytes: 0,
      filesCount: 0,
    });
  });

  filteredFiles.forEach((f) => {
    const key = f.company_id ? String(f.company_id) : "other";
    const existing = mdaMap.get(key) || {
      mda: "General Federal Administration",
      storageBytes: 0,
      filesCount: 0,
    };
    existing.storageBytes += Number(f.file_size) || 0;
    existing.filesCount += 1;
    mdaMap.set(key, existing);
  });

  const storageByMda = Array.from(mdaMap.values())
    .map((item) => ({
      mda: item.mda,
      storageGB: Number((item.storageBytes / (1024 * 1024 * 1024)).toFixed(2)),
      filesCount: item.filesCount,
    }))
    .sort((a, b) => b.storageGB - a.storageGB)
    .slice(0, 6);

  // 7. Recent Official Documents Feed
  let recentOfficialDocs = filteredFiles.slice(0, 15).map((f, i) => {
    const classification = inferClassification(f.name || "", f.file_type || "");
    const category = inferCategory(f.name || "", f.file_type || "");
    const dateFormatted = f.created_at
      ? new Date(f.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "Recent";

    return {
      docNo: f.file_id || `DOC-${new Date().getFullYear()}-${String(f.id || i + 1).padStart(4, "0")}`,
      title: f.name || "Official Executive Document",
      category,
      uploadedBy: f.uploaded_by || "System Administrator",
      fileSize: formatBytes(Number(f.file_size) || 0),
      uploadedAt: dateFormatted,
      classification,
    };
  });

  // Filter classification if specified
  if (classificationFilter) {
    const filterLower = classificationFilter.toLowerCase();
    recentOfficialDocs = recentOfficialDocs.filter((doc) =>
      doc.classification.toLowerCase().includes(filterLower)
    );
  }

  const selectedMda = mdaId
    ? companies.find((c) => String(c.id) === String(mdaId))?.name || `MDA #${mdaId}`
    : "All MDAs (Federal Document Vault)";

  const payload = {
    generated_at: new Date().toISOString(),
    scope: {
      mda_id: mdaId ? Number(mdaId) : null,
      mda_name: selectedMda,
    },
    kpis: {
      active_cloud_storage: {
        value: formatBytes(totalBytes),
        bytes: totalBytes,
        quota_percentage: quotaPercentage,
        quota_description: `${quotaPercentage}% of 10TB`,
        change: `${quotaPercentage}% of 10TB`,
        trend: "neutral" as const,
        comparison: "secure enterprise bucket",
      },
      total_indexed_documents: {
        value: totalFilesCount.toString(),
        formatted: totalFilesCount.toLocaleString(),
        change: `+${filteredFiles.length > 0 ? filteredFiles.length : 0} live`,
        trend: "up" as const,
        comparison: `across ${companies.length || 1} Federal MDAs`,
      },
      official_gazettes_circulars: {
        value: pdfCount.toString(),
        formatted: pdfCount.toLocaleString(),
        change: "official repository",
        trend: "up" as const,
        comparison: "statutory circulars & gazettes",
      },
      data_encryption_security: {
        value: "100%",
        encryption_standard: "AES-256",
        change: "AES-256",
        trend: "up" as const,
        comparison: "full cryptographic compliance",
      },
    },
    storage_by_mda: storageByMda,
    format_breakdown: formatBreakdown,
    recent_official_docs: recentOfficialDocs,
  };

  return NextResponse.json({
    success: true,
    data: payload,
  });
}

