import { I18nProvider } from "@/app/providers/i18n-provider";
import { QueryProvider } from "@/app/providers/query-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { TelegramProvider } from "@/app/providers/telegram-provider";
import { AuthBootstrapProvider } from "@/app/providers/auth-bootstrap-provider";
import { RouterProvider } from "@/app/providers/router-provider";

export const AppProviders = () => {
  return (
    <I18nProvider>
      <ThemeProvider>
        <QueryProvider>
          <TelegramProvider>
            <AuthBootstrapProvider>
              <RouterProvider />
            </AuthBootstrapProvider>
          </TelegramProvider>
        </QueryProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};
