import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  publishAnnouncement,
  updateAnnouncement,
} from "@/services/endpoints/organizations/announcement/announcement";
import {
  CREATE_ANNOUNCEMENT,
  DELETE_ANNOUNCEMENT,
  GET_ANNOUNCEMENT,
  GET_ANNOUNCEMENTS,
  PUBLISH_ANNOUNCEMENT,
  UPDATE_ANNOUNCEMENT,
} from "@/services/constants/organizations/announcement";
import {
  Announcement,
  CreateAnnouncementPayload,
  CreateAnnouncementResponse,
  DeleteAnnouncementResponse,
  GetAnnouncementResponse,
  GetAnnouncementsResponse,
  PublishAnnouncementPayload,
  PublishAnnouncementResponse,
  UpdateAnnouncementPayload,
  UpdateAnnouncementResponse,
} from "@/types/organizations/announcement/announcement-management";

export const useGetAnnouncements = () => {
  return useQuery<GetAnnouncementsResponse, Error>({
    queryKey: [GET_ANNOUNCEMENTS],
    queryFn: getAnnouncements,
  });
};

export const useGetAnnouncementById = (id?: string | number) => {
  return useQuery<GetAnnouncementResponse, Error>({
    queryKey: [GET_ANNOUNCEMENT, id],
    queryFn: () => getAnnouncementById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateAnnouncementResponse, Error, CreateAnnouncementPayload>({
    mutationKey: [CREATE_ANNOUNCEMENT],
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENTS] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateAnnouncementResponse, Error, UpdateAnnouncementPayload>({
    mutationKey: [UPDATE_ANNOUNCEMENT],
    mutationFn: updateAnnouncement,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENTS] });
      queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENT, variables.id] });
    },
  });
};

export const usePublishAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation<PublishAnnouncementResponse, Error, PublishAnnouncementPayload>({
    mutationKey: [PUBLISH_ANNOUNCEMENT],
    mutationFn: publishAnnouncement,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENTS] });
      queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENT, variables.id] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteAnnouncementResponse, Error, string | number>({
    mutationKey: [DELETE_ANNOUNCEMENT],
    mutationFn: deleteAnnouncement,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENTS] });
      queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENT, deletedId] });
    },
  });
};

export const useAnnouncementsData = () => {
  return useQuery<Announcement[], Error>({
    queryKey: [GET_ANNOUNCEMENTS, "normalized"],
    queryFn: async () => {
      const response = await getAnnouncements();
      return response.data || [];
    },
  });
};
