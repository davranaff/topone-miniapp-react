import { useMutation } from "@tanstack/react-query";
import { profileApi } from "@/features/profile/api/profile.api";
import { queryClient } from "@/shared/api/query-client";
import { queryKeys } from "@/shared/api/query-keys";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { sessionStorage } from "@/shared/auth/session-storage";

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: profileApi.updateMe,
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile.me, profile);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      const user = {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        phoneNumber: profile.phoneNumber,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        roles: profile.roles,
      };
      const tokens = useAuthStore.getState().tokens;
      if (tokens) {
        useAuthStore.getState().setSession({ user, tokens });
      }
      sessionStorage.setUser(user);
    },
  });
};
