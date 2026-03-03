import { MessageCircle } from "lucide-react";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";

export const ChatChannelPage = () => (
  <MobileScreen>
    <PageHeader title="Chat" backButton />
    <div className="mt-10">
      <EmptyState
        icon={<MessageCircle className="h-8 w-8" />}
        title="Chat tez kunda"
        description="GetStream Chat kanali integratsiyasi ishlab chiqilmoqda."
      />
    </div>
  </MobileScreen>
);
