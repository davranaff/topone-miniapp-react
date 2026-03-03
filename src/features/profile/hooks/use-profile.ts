import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { profileApi } from "@/features/profile/api/profile.api";

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: profileApi.getMe,
  });
};
