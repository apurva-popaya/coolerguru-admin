export const billingMoney = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);

export const billingDate = (value: string | null, fallback = "Not available") =>
  value ? new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
  }).format(new Date(value)) : fallback;

export const billingStatus = (status: string) =>
  status === "CAPTURED" ? "Success" : status.toLowerCase().replace(/(^|[_ ])\w/g, (part) => part.replace("_", " ").toUpperCase());
