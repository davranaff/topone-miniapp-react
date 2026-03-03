import { useTranslation } from "react-i18next";

export const useLocale = () => {
  const { i18n, t } = useTranslation();

  return {
    locale: i18n.language,
    setLocale: (locale: string) => i18n.changeLanguage(locale),
    t,
  };
};
