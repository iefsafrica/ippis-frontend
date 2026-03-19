import { useMutation } from "@tanstack/react-query";
import { submitEmploymentInfo } from "@/services/endpoints/register/employment-info";

export const useEmploymentInfo = () => {
  return useMutation({
    mutationKey: ["register", "employment-info"],
    mutationFn: submitEmploymentInfo,
  });
};
