export interface FileManagerAnalyticsParams {
  mda_id?: number | string;
  company_id?: number | string;
  date_from?: string;
  date_to?: string;
  classification?: string;
}

export interface StorageKpiItem {
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral" | string;
  comparison?: string;
  bytes?: number;
  quota_percentage?: number;
  quota_description?: string;
}

export interface StorageByMdaItem {
  mda: string;
  storageGB: number;
  filesCount: number;
}

export interface FileFormatBreakdownItem {
  name: string;
  count: number;
  value: number; // percentage
  color: string;
}

export interface RecentOfficialDocItem {
  docNo: string;
  title: string;
  category: string;
  uploadedBy: string;
  fileSize: string;
  uploadedAt: string;
  classification: "Official / Secret" | "Confidential" | "Restricted" | "Public Official" | string;
}

export interface FileManagerAnalyticsData {
  generated_at?: string;
  scope?: {
    mda_id?: number | string | null;
    mda_name?: string;
  };
  kpis: {
    active_cloud_storage: StorageKpiItem;
    total_indexed_documents: StorageKpiItem;
    official_gazettes_circulars: StorageKpiItem;
    data_encryption_security: StorageKpiItem;
  };
  storage_by_mda: StorageByMdaItem[];
  format_breakdown: FileFormatBreakdownItem[];
  recent_official_docs: RecentOfficialDocItem[];
}

export interface FileManagerAnalyticsResponse {
  success: boolean;
  data: FileManagerAnalyticsData;
  message?: string;
}

