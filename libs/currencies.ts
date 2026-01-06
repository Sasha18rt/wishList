export type CurrencyOption = { code: string; label: string };

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "UAH", label: "UAH — Ukrainian Hryvnia" },
  { code: "PLN", label: "PLN — Polish Złoty" },
  { code: "CZK", label: "CZK — Czech Koruna" },
  { code: "TRY", label: "TRY — Turkish Lira" },

  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "NZD", label: "NZD — New Zealand Dollar" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "SEK", label: "SEK — Swedish Krona" },
  { code: "NOK", label: "NOK — Norwegian Krone" },
  { code: "DKK", label: "DKK — Danish Krone" },
  { code: "HUF", label: "HUF — Hungarian Forint" },
  { code: "RON", label: "RON — Romanian Leu" },
  { code: "BGN", label: "BGN — Bulgarian Lev" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "BRL", label: "BRL — Brazilian Real" },
  { code: "MXN", label: "MXN — Mexican Peso" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "HKD", label: "HKD — Hong Kong Dollar" },
  { code: "ILS", label: "ILS — Israeli New Shekel" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "KRW", label: "KRW — South Korean Won" },
];

export const SUPPORTED_CURRENCY_CODES = new Set(
  CURRENCIES.map((c) => c.code)
);

// (опційно) fallback символи, якщо Intl повертає код
export const CURRENCY_SYMBOL_FALLBACK: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  UAH: "₴",
  PLN: "zł",
  CZK: "Kč",
  TRY: "₺",
  CHF: "CHF",
  JPY: "¥",
  AUD: "A$",
  NZD: "NZ$",
  CNY: "¥",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  HUF: "Ft",
  RON: "lei",
  BGN: "лв",
  INR: "₹",
  BRL: "R$",
  MXN: "MX$",
  SGD: "S$",
  HKD: "HK$",
  ILS: "₪",
  ZAR: "R",
  KRW: "₩",
};
