export const formatCurrency = (value?: string | number) => {
  const amount = typeof value === "string" ? parseFloat(value) : value
  if (amount == null || Number.isNaN(amount)) {
    return "₦0.00"
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount)
}
