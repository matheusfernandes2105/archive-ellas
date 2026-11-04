/**
 * Textos de apresentação derivados dos DTOs.
 * @param {{ installment: { count: number, label: string } | null }} price
 */
export function installmentText(price) {
  return price.installment ? `ou ${price.installment.count}x de ${price.installment.label} sem juros` : "";
}
