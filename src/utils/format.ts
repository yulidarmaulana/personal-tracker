/**
 * Format number to Indonesian Rupiah currency string
 * @param amount Number to format
 * @returns Formatted string (e.g. Rp 1.000.000)
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
