import { useMutation } from "@tanstack/react-query"
import { verifyNin } from "@/services/endpoints/verify"
import { VerifyNinPayload, VerifyNinResponse } from "@/types/verify"
import { QUERY_KEYS } from "@/services/constants/verify"

export const useVerifyNin = () => {
  return useMutation<VerifyNinResponse, Error, VerifyNinPayload>({
    mutationKey: [QUERY_KEYS.VERIFY_NIN],
    mutationFn: verifyNin,
  })
}
