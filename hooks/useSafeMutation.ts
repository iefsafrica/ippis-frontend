// hooks/useSafeMutation.ts
import { useTransition } from 'react';
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useSafeMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    invalidateQueries?: Array<any[]>;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const queryClient = useQueryClient();
  const [isTransitionPending, startTransition] = useTransition();

  const mutation = useMutation({
    ...options,
    onSuccess: (data, variables, context) => {
      startTransition(() => {
        // Invalidate queries in transition
        if (options.invalidateQueries) {
          options.invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
        
        // Show success message
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        
        // Call original onSuccess if provided
        if (options.onSuccess) {
            //@ts-expect-error TS is confused here
          options.onSuccess(data, variables, context);
        }
      });
    },
    onError: (error, variables, context) => {
        //@ts-expect-error TS is confused here
      toast.error(options.errorMessage || error.message || 'Operation failed');
      if (options.onError) {
        //@ts-expect-error TS is confused here
        options.onError(error, variables, context);
      }
    },
  });

  // Wrapper for mutateAsync that uses transition
  const safeMutateAsync = async (variables: TVariables) => {
    return new Promise<TData>((resolve, reject) => {
      startTransition(async () => {
        try {
          const result = await mutation.mutateAsync(variables);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  return {
    ...mutation,
    safeMutateAsync,
    isTransitionPending,
    isPending: mutation.isPending || isTransitionPending,
  };
}