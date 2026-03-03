export const formatCompactNumber = (value: number, locale = "ru-RU") =>
  new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
