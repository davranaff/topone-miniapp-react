import type { UserProfile } from "@/entities/user/types";
import { Badge } from "@/shared/ui/badge";

export const ProfileSummaryCard = ({ profile }: { profile: UserProfile }) => {
  return (
    <section className="rounded-[1.5rem] border border-border bg-slate-950 p-6 text-white shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-primary">Session</p>
          <h2 className="mt-2 text-3xl font-semibold">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="mt-2 text-sm text-slate-300">@{profile.username}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.roles.map((role) => (
            <Badge key={role}>{role}</Badge>
          ))}
          {profile.subscriptionType ? <Badge>{profile.subscriptionType}</Badge> : null}
        </div>
      </div>
    </section>
  );
};
