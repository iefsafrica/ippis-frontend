export type AnnouncementStatus = "draft" | "published" | string;

export interface Announcement {
  id: string | number;
  company_code: string;
  title: string;
  content: string;
  audience: string;
  status: AnnouncementStatus;
  publish_date?: string | null;
  expiry_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GetAnnouncementsResponse {
  success: boolean;
  message?: string;
  data: Announcement[];
}

export interface GetAnnouncementResponse {
  success: boolean;
  message?: string;
  data: Announcement;
}

export interface CreateAnnouncementPayload {
  company_code: string;
  title: string;
  content: string;
  audience: string;
  status: AnnouncementStatus;
}

export interface CreateAnnouncementResponse {
  success: boolean;
  message?: string;
  data: Announcement;
}

export interface UpdateAnnouncementPayload {
  id: string | number;
  title?: string;
  content?: string;
  audience?: string;
  status?: AnnouncementStatus;
  publish_date?: string | null;
  expiry_date?: string | null;
}

export interface UpdateAnnouncementResponse {
  success: boolean;
  message?: string;
  data: Announcement;
}

export interface PublishAnnouncementPayload {
  id: string | number;
  status: "published";
  publish_date: string;
}

export interface PublishAnnouncementResponse {
  success: boolean;
  message?: string;
  data: Announcement;
}

export interface DeleteAnnouncementResponse {
  success: boolean;
  message?: string;
  data?: Announcement;
}
