import { Button } from "@/shared/ui/button";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { useNavigate } from "react-router-dom";
import { getTelegramLoginPath } from "@/shared/lib/telegram-webapp";

export const TelegramLoginButton = ({ onClick }: { onClick?: () => void }) => {
  const telegram = useTelegram();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    navigate(getTelegramLoginPath(telegram.isAvailable()));
  };

  return (
    <Button className="w-full" variant="secondary" type="button" onClick={handleClick}>
      Войти через Telegram
    </Button>
  );
};
