import { MessageCircle } from "lucide-react";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";

export const ChatPage = () => (
  <MobileScreen className="space-y-4 lg:space-y-5">
    <PageHeader title="Chat" />
    <div className="mt-10">
      <EmptyState
        icon={<MessageCircle className="h-8 w-8" />}
        title="Chat tez kunda"
        description="GetStream Chat integratsiyasi ishlab chiqilmoqda."
      />
    </div>
  </MobileScreen>
);
