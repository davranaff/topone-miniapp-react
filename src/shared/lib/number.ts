const toFiniteNumber = (value: number) => (Number.isFinite(value) ? value : 0);

export const formatCompactNumber = (value: number, locale = "ru-RU") =>
  new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toFiniteNumber(value));
