/**
 * The currency amounts are shown in. Every formatMoney() call used to default
 * to USD, so a Dutch business's prices rendered as "$" even though the backend
 * charges the business's own currency. The booking widget sets this from the
 * business it is showing; NEXT_PUBLIC_DEFAULT_CURRENCY covers everything else.
 */
let activeCurrency: string =
    (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "EUR").toUpperCase();

export function setActiveCurrency(currency?: string | null) {
    if (currency && /^[A-Za-z]{3}$/.test(currency)) {
        activeCurrency = currency.toUpperCase();
    }
}

export function getActiveCurrency(): string {
    return activeCurrency;
}

/**
 * The day in a timezone as YYYY-MM-DD. `toISOString().slice(0, 10)` gives the
 * UTC date, which for anyone east of UTC is the previous day around local
 * midnight — the date strip selected the wrong day for every Dutch visitor.
 */
export function isoDateInTimeZone(date: Date, timeZone?: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}
