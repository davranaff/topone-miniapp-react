import { Outlet } from "react-router-dom";
import { useTelegram } from "@/shared/hooks/use-telegram";

export const TelegramShell = () => {
  const telegram = useTelegram();
  const insets = telegram.getSafeAreaInsets();

  return (
    <div style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Outlet />
    </div>
  );
};
