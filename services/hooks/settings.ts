import { useQuery } from "@tanstack/react-query";
import { useSafeMutation } from "@/hooks/useSafeMutation";
import {
  GET_ADVANCED_SETTINGS,
  GET_APPEARANCE_SETTINGS,
  GET_EMAIL_SETTINGS,
  GET_SETTINGS,
  GET_SETTINGS_BY_CATEGORY,
  UPDATE_ADVANCED_SETTINGS,
  UPDATE_APPEARANCE_SETTINGS,
  UPDATE_EMAIL_SETTINGS,
  UPDATE_SETTINGS,
} from "@/services/constants/settings";
import {
  getAdvancedSettings,
  getAllSettings,
  getAppearanceSettings,
  getEmailSettings,
  getSettingsByCategory,
  normalizeSettingsState,
  updateAdvancedSettings,
  updateAppearanceSettings,
  updateEmailSettings,
  updateSettings,
} from "@/services/endpoints/settings/settings";
import type {
  GetAllSettingsResponse,
  GetSettingsByCategoryResponse,
  GetSingleSettingsResponse,
  SettingsCategory,
  SettingsFormState,
  UpdateAdvancedSettingsPayload,
  UpdateAppearanceSettingsPayload,
  UpdateEmailSettingsPayload,
  UpdateSettingsPayload,
} from "@/types/settings";

export const useGetSettings = () => {
  return useQuery<GetAllSettingsResponse, Error>({
    queryKey: [GET_SETTINGS],
    queryFn: getAllSettings,
  });
};

export const useGetNormalizedSettings = () => {
  return useQuery<SettingsFormState, Error>({
    queryKey: [GET_SETTINGS, "normalized"],
    queryFn: async () => {
      const response = await getAllSettings();
      return normalizeSettingsState(response);
    },
  });
};

export const useGetSettingsByCategory = (category: SettingsCategory) => {
  return useQuery<GetSettingsByCategoryResponse, Error>({
    queryKey: [GET_SETTINGS_BY_CATEGORY, category],
    queryFn: () => getSettingsByCategory(category),
    enabled: Boolean(category),
  });
};

export const useGetAdvancedSettings = () => {
  return useQuery<GetSingleSettingsResponse, Error>({
    queryKey: [GET_ADVANCED_SETTINGS],
    queryFn: getAdvancedSettings,
  });
};

export const useGetAppearanceSettings = () => {
  return useQuery<GetSingleSettingsResponse, Error>({
    queryKey: [GET_APPEARANCE_SETTINGS],
    queryFn: getAppearanceSettings,
  });
};

export const useGetEmailSettings = () => {
  return useQuery<GetSingleSettingsResponse, Error>({
    queryKey: [GET_EMAIL_SETTINGS],
    queryFn: getEmailSettings,
  });
};

export const useUpdateSettings = () => {
  return useSafeMutation<GetAllSettingsResponse, Error, UpdateSettingsPayload>({
    mutationKey: [UPDATE_SETTINGS],
    mutationFn: updateSettings,
    invalidateQueries: [[GET_SETTINGS], [GET_SETTINGS_BY_CATEGORY], [GET_ADVANCED_SETTINGS], [GET_APPEARANCE_SETTINGS], [GET_EMAIL_SETTINGS]],
    successMessage: "Settings updated successfully",
    errorMessage: "Failed to update settings",
  });
};

export const useUpdateAdvancedSettings = () => {
  return useSafeMutation<GetSingleSettingsResponse, Error, UpdateAdvancedSettingsPayload>({
    mutationKey: [UPDATE_ADVANCED_SETTINGS],
    mutationFn: updateAdvancedSettings,
    invalidateQueries: [[GET_SETTINGS], [GET_SETTINGS_BY_CATEGORY], [GET_ADVANCED_SETTINGS]],
    successMessage: "Advanced settings updated successfully",
    errorMessage: "Failed to update advanced settings",
  });
};

export const useUpdateAppearanceSettings = () => {
  return useSafeMutation<GetSingleSettingsResponse, Error, UpdateAppearanceSettingsPayload>({
    mutationKey: [UPDATE_APPEARANCE_SETTINGS],
    mutationFn: updateAppearanceSettings,
    invalidateQueries: [[GET_SETTINGS], [GET_SETTINGS_BY_CATEGORY], [GET_APPEARANCE_SETTINGS]],
    successMessage: "Appearance settings updated successfully",
    errorMessage: "Failed to update appearance settings",
  });
};

export const useUpdateEmailSettings = () => {
  return useSafeMutation<GetSingleSettingsResponse, Error, UpdateEmailSettingsPayload>({
    mutationKey: [UPDATE_EMAIL_SETTINGS],
    mutationFn: updateEmailSettings,
    invalidateQueries: [[GET_SETTINGS], [GET_SETTINGS_BY_CATEGORY], [GET_EMAIL_SETTINGS]],
    successMessage: "Email settings updated successfully",
    errorMessage: "Failed to update email settings",
  });
};
