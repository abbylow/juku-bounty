export const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const oneWeekFromNow = new Date();
oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

const twoWeeksFromNow = new Date();
twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

export const oneMonthFromNow = new Date();
oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

export const EXPIRY_PRESET: Record<string, Date> = {
  "In 7 days": oneWeekFromNow,
  "In 14 days": twoWeeksFromNow,
  "In 1 month": oneMonthFromNow,
}

export const ACCEPTABLE_CURRENCIES = {
  USDC: "usdc",
  USDT: "usdt"
} as const;
export type ACCEPTABLE_CURRENCIES = typeof ACCEPTABLE_CURRENCIES[keyof typeof ACCEPTABLE_CURRENCIES];

export const MAX_NUM_OF_TAGS = 5;
