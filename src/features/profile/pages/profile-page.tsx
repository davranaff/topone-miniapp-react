import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ProfileSummaryCard } from "@/widgets/profile/profile-summary-card";

export const ProfilePage = () => {
  const profile = useProfile();

  if (profile.isLoading) {
    return <Skeleton className="h-[32rem] w-full" />;
  }

  if (!profile.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Профиль" subtitle="Session-bound данные и foundation для self-update." />
      <ProfileSummaryCard profile={profile.data} />
      <ProfileForm profile={profile.data} />
    </div>
  );
};
