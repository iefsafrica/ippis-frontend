import api from "@/services/axios";
import type {
  GetAllSettingsResponse,
  GetSettingsByCategoryResponse,
  GetSingleSettingsResponse,
  SettingsCategory,
  SettingsFormState,
  SettingsSectionRecord,
  SettingsValue,
  UpdateAdvancedSettingsPayload,
  UpdateAppearanceSettingsPayload,
  UpdateEmailSettingsPayload,
  UpdateSettingsPayload,
} from "@/types/settings";

const SETTINGS_BASE_URL = "/admin/settings";

const request = async <T>(method: "get" | "post" | "put", url: string, config?: { params?: Record<string, unknown>; data?: unknown }) => {
  const response = await api.request<T>({
    method,
    url,
    params: config?.params,
    data: config?.data,
  });

  return response.data;
};

const isValueObject = (value: unknown): value is SettingsValue => {
  return typeof value === "object" && value !== null && "value" in value;
};

const readSettingValue = <T extends string | boolean | number>(
  source: SettingsSectionRecord | undefined,
  key: string,
  fallback: T,
) => {
  if (!source || !(key in source)) {
    return fallback;
  }

  const raw = source[key];

  if (isValueObject(raw)) {
    return (raw.value as T) ?? fallback;
  }

  if (raw === null || raw === undefined) {
    return fallback;
  }

  return raw as T;
};

const readBooleanSetting = (source: SettingsSectionRecord | undefined, key: string, fallback: boolean) => {
  if (!source || !(key in source)) {
    return fallback;
  }

  const raw = source[key];

  if (isValueObject(raw)) {
    if (typeof raw.value === "boolean") {
      return raw.value;
    }

    if (typeof raw.value === "string") {
      return raw.value === "true";
    }
  }

  if (typeof raw === "boolean") {
    return raw;
  }

  if (typeof raw === "string") {
    return raw === "true";
  }

  return fallback;
};

export const normalizeSettingsState = (response?: GetAllSettingsResponse | null): SettingsFormState => {
  const data = response?.data ?? {};

  const general = data.general;
  const notifications = data.notifications;
  const advanced = data.advanced;
  const appearance = data.appearance;
  const email = data.email;

  return {
    systemName: String(readSettingValue(general, "systemName", "IPPIS Admin Portal")),
    systemLogo: String(readSettingValue(general, "systemLogo", "")),
    systemLanguage: String(readSettingValue(general, "systemLanguage", "en")),
    systemTimezone: String(readSettingValue(general, "systemTimezone", "Africa/Lagos")),
    emailNotifications: readBooleanSetting(notifications, "emailNotifications", true),
    systemNotifications: readBooleanSetting(notifications, "systemNotifications", true),
    documentVerificationMode: String(readSettingValue(advanced, "documentVerificationMode", "manual")),
    systemDateFormat: String(readSettingValue(advanced, "systemDateFormat", "DD/MM/YYYY")),
    systemTimeFormat: String(readSettingValue(advanced, "systemTimeFormat", "HH:mm")),
    systemCurrency: String(readSettingValue(advanced, "systemCurrency", "NGN")),
    systemDecimalSeparator: String(readSettingValue(advanced, "systemDecimalSeparator", ".")),
    systemThousandSeparator: String(readSettingValue(advanced, "systemThousandSeparator", ",")),
    debugMode: readBooleanSetting(advanced, "debugMode", false),
    maintenanceMode: readBooleanSetting(advanced, "maintenanceMode", false),
    systemTheme: String(readSettingValue(appearance, "systemTheme", "light")),
    primaryColor: String(readSettingValue(appearance, "primaryColor", "#22c55e")),
    secondaryColor: String(readSettingValue(appearance, "secondaryColor", "#f97316")),
    fontFamily: String(readSettingValue(appearance, "fontFamily", "Inter")),
    emailServer: String(readSettingValue(email, "emailServer", "")),
    emailPort: String(readSettingValue(email, "emailPort", "")),
    emailUsername: String(readSettingValue(email, "emailUsername", "")),
    emailPassword: String(readSettingValue(email, "emailPassword", "")),
    emailFrom: String(readSettingValue(email, "emailFrom", "")),
    emailReplyTo: String(readSettingValue(email, "emailReplyTo", "")),
    emailTemplate: String(readSettingValue(email, "emailTemplate", "default")),
  };
};

export const getAllSettings = async (): Promise<GetAllSettingsResponse> => {
  return request<GetAllSettingsResponse>("get", SETTINGS_BASE_URL);
};

export const getSettingsByCategory = async (category: SettingsCategory): Promise<GetSettingsByCategoryResponse> => {
  return request<GetSettingsByCategoryResponse>("get", SETTINGS_BASE_URL, {
    params: { category },
  });
};

export const getAdvancedSettings = async (): Promise<GetSingleSettingsResponse> => {
  return request<GetSingleSettingsResponse>("get", `${SETTINGS_BASE_URL}/advanced`);
};

export const getAppearanceSettings = async (): Promise<GetSingleSettingsResponse> => {
  return request<GetSingleSettingsResponse>("get", `${SETTINGS_BASE_URL}/appearance`);
};

export const getEmailSettings = async (): Promise<GetSingleSettingsResponse> => {
  return request<GetSingleSettingsResponse>("get", `${SETTINGS_BASE_URL}/email`);
};

export const updateSettings = async (payload: UpdateSettingsPayload): Promise<GetAllSettingsResponse> => {
  return request<GetAllSettingsResponse>("put", SETTINGS_BASE_URL, {
    data: payload,
  });
};

export const updateAdvancedSettings = async (
  payload: UpdateAdvancedSettingsPayload,
): Promise<GetSingleSettingsResponse> => {
  return request<GetSingleSettingsResponse>("put", `${SETTINGS_BASE_URL}/advanced`, {
    data: payload,
  });
};

export const updateAppearanceSettings = async (
  payload: UpdateAppearanceSettingsPayload,
): Promise<GetSingleSettingsResponse> => {
  return request<GetSingleSettingsResponse>("put", `${SETTINGS_BASE_URL}/appearance`, {
    data: payload,
  });
};

export const updateEmailSettings = async (payload: UpdateEmailSettingsPayload): Promise<GetSingleSettingsResponse> => {
  return request<GetSingleSettingsResponse>("put", `${SETTINGS_BASE_URL}/email`, {
    data: payload,
  });
};
