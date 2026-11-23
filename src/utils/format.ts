// Change these to your locale/currency.
const LOCALE = 'en-US';
const CURRENCY = 'JPY'; // Yen has no decimal places, so amounts are rounded to whole yen.

const moneyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

export const formatMoney = (n: number) => moneyFormatter.format(n);
