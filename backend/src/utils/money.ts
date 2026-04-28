export function parseAmountToCents(input: string): number {
  const trimmed = input.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error("Invalid amount format");
  }
  const [rupees, paise = ""] = trimmed.split(".");
  const normalizedPaise = (paise + "00").slice(0, 2);
  return parseInt(rupees, 10) * 100 + parseInt(normalizedPaise, 10);
}

export function formatCentsToINR(cents: number): string {
  const rupees = (cents / 100).toFixed(2);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(Number(rupees));
}