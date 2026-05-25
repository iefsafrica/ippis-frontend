export interface GeneralSettingsValues {
  systemName: string;
  systemLogo: string;
  systemLanguage: string;
  systemTimezone: string;
}

export interface NotificationSettingsValues {
  emailNotifications: boolean;
  systemNotifications: boolean;
}

export interface AdvancedSettingsValues {
  documentVerificationMode: string;
  systemDateFormat: string;
  systemTimeFormat: string;
  systemCurrency: string;
  systemDecimalSeparator: string;
  systemThousandSeparator: string;
  debugMode: boolean;
  maintenanceMode: boolean;
}

export interface AppearanceSettingsValues {
  systemTheme: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface EmailSettingsValues {
  emailServer: string;
  emailPort: string;
  emailUsername: string;
  emailPassword: string;
  emailFrom: string;
  emailReplyTo: string;
  emailTemplate: string;
}

export interface SettingsFormState
  extends GeneralSettingsValues,
    NotificationSettingsValues,
    AdvancedSettingsValues,
    AppearanceSettingsValues,
    EmailSettingsValues {}

export const DEFAULT_SETTINGS_FORM_STATE: SettingsFormState = {
  systemName: "IPPIS Admin Portal",
  systemLogo: "",
  systemLanguage: "en",
  systemTimezone: "Africa/Lagos",
  emailNotifications: true,
  systemNotifications: true,
  documentVerificationMode: "manual",
  systemDateFormat: "DD/MM/YYYY",
  systemTimeFormat: "HH:mm",
  systemCurrency: "NGN",
  systemDecimalSeparator: ".",
  systemThousandSeparator: ",",
  debugMode: false,
  maintenanceMode: false,
  systemTheme: "light",
  primaryColor: "#22c55e",
  secondaryColor: "#f97316",
  fontFamily: "Inter",
  emailServer: "",
  emailPort: "",
  emailUsername: "",
  emailPassword: "",
  emailFrom: "",
  emailReplyTo: "",
  emailTemplate: "default",
};

export type SettingsCategory =
  | "general"
  | "notifications"
  | "advanced"
  | "appearance"
  | "email";

export interface SettingsValue<T = string | boolean> {
  value: T;
  dataType?: string;
  updatedAt?: string;
  updatedBy?: string | null;
}

export type SettingsSectionRecord = Record<string, SettingsValue | string | boolean | number | null | undefined>;

export interface GetAllSettingsResponse {
  success: boolean;
  categories?: SettingsCategory[];
  data: Partial<Record<SettingsCategory, SettingsSectionRecord>>;
  message?: string;
}

export interface GetSettingsByCategoryResponse {
  success: boolean;
  categories?: SettingsCategory[];
  data: Record<string, SettingsSectionRecord>;
  message?: string;
}

export interface GetSingleSettingsResponse {
  success: boolean;
  data: SettingsSectionRecord;
  options?: Record<string, unknown>;
  message?: string;
}

export interface UpdateSettingsPayload extends Partial<GeneralSettingsValues>, Partial<NotificationSettingsValues> {
  updatedBy?: string;
}

export interface UpdateAdvancedSettingsPayload extends Partial<AdvancedSettingsValues> {
  updatedBy?: string;
}

export interface UpdateAppearanceSettingsPayload extends Partial<AppearanceSettingsValues> {
  updatedBy?: string;
}

export interface UpdateEmailSettingsPayload extends Partial<EmailSettingsValues> {
  updatedBy?: string;
}
