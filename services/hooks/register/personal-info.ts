import { useMutation } from "@tanstack/react-query";
import { submitPersonalInfo } from "@/services/endpoints/register/personal-info";

export const usePersonalInfo = () => {
  return useMutation({
    mutationKey: ["register", "personal-info"],
    mutationFn: submitPersonalInfo,
  });
};
