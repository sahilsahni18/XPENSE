export function formatINRFromCents(cents: number): string {
  const rupees = (cents / 100).toFixed(2);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(Number(rupees));
}