import { Button } from "@/shared/ui/button";
import { useTelegram } from "@/shared/hooks/use-telegram";

export const TelegramLoginButton = ({ onClick }: { onClick?: () => void }) => {
  const telegram = useTelegram();

  return (
    <Button className="w-full" variant="secondary" type="button" disabled={!telegram.isAvailable()} onClick={onClick}>
      Войти через Telegram
    </Button>
  );
};
