import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/shared/ui/empty-state";

type SubscriptionRequiredStateProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  compact?: boolean;
  className?: string;
};

export const SubscriptionRequiredState = ({
  title = "Подписка требуется",
  description = "Для доступа к этому разделу нужно оформить подписку.",
  ctaLabel = "Оформить подписку",
  compact,
  className,
}: SubscriptionRequiredStateProps) => {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={<Lock className="h-8 w-8" />}
      title={title}
      description={description}
      compact={compact}
      className={className}
      action={{
        label: ctaLabel,
        onClick: () => navigate("/subscription"),
      }}
    />
  );
};
