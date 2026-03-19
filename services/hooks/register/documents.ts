import { useMutation } from "@tanstack/react-query";
import { submitRegistrationDocuments } from "@/services/endpoints/register/documents";

export const useRegistrationDocuments = () => {
  return useMutation({
    mutationKey: ["register", "documents"],
    mutationFn: submitRegistrationDocuments,
  });
};
