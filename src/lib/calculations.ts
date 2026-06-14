import { Customer, ProductType, Transaction, TransactionItem, Product } from '@/types';

/**
 * Compute cascading discounted unit price.
 * Formula: Base × Π(1 − dᵢ/100) over the customer's discount steps for that type
 */
export function computeDiscountedPrice(
  basePrice: number,
  customer: Customer,
  productType: ProductType
): number {
  const discountSteps = productType === 'LM' ? customer.diskon_lm : customer.diskon_br;
  let price = basePrice;
  for (const d of discountSteps) {
    price *= 1 - d / 100;
  }
  return price;
}

export function getEffectiveDiscount(
  customer: Customer,
  productType: ProductType
): number {
  const discountSteps = productType === 'LM' ? customer.diskon_lm : customer.diskon_br;
  let multiplier = 1;
  for (const d of discountSteps) {
    multiplier *= 1 - d / 100;
  }
  return Math.round((1 - multiplier) * 10000) / 100;
}

export function computeLineOmzet(discountedUnitPrice: number, quantity: number): number {
  return discountedUnitPrice * quantity;
}

export function computeLineLaba(discountedUnitPrice: number, hargaModal: number, quantity: number): number {
  return (discountedUnitPrice - hargaModal) * quantity;
}

export function computeTransactionOmzet(lineOmzets: number[]): number {
  return lineOmzets.reduce((sum, o) => sum + o, 0);
}

export function computeAmountOwed(transactionOmzet: number, ongkir: number): number {
  return transactionOmzet + ongkir;
}

export function computeTransactionLaba(lineLabas: number[]): number {
  return lineLabas.reduce((sum, l) => sum + l, 0);
}

export function computeBonusesAvailable(
  accumulatedPaidOmzet: number,
  threshold: number,
  bonusesGranted: number
): number {
  if (threshold <= 0) return 0;
  return Math.max(0, Math.floor(accumulatedPaidOmzet / threshold) - bonusesGranted);
}

export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID').replace(/,/g, '.');
}

export function formatJuta(amount: number): string {
  const jt = amount / 1_000_000;
  return jt.toFixed(jt % 1 === 0 ? 0 : 1) + ' jt';
}

export function getTransactionLineData(
  tx: Transaction
): {
  items: Array<{
    item: TransactionItem;
    product: Product | undefined;
    discountedUnitPrice: number;
    lineOmzet: number;
    lineLaba: number;
  }>;
  transactionOmzet: number;
  transactionLaba: number;
  amountOwed: number;
} {
  const customer = tx.customer;
  if (!customer || !tx.items) {
    return {
      items: [],
      transactionOmzet: 0,
      transactionLaba: 0,
      amountOwed: tx.ongkir,
    };
  }

  const computed = tx.items.map((item) => {
    const product = item.product as Product | undefined;
    if (!product) {
      return {
        item,
        product: undefined,
        discountedUnitPrice: 0,
        lineOmzet: 0,
        lineLaba: 0,
      };
    }

    if (tx.is_bonus) {
      return {
        item,
        product,
        discountedUnitPrice: 0,
        lineOmzet: 0,
        lineLaba: 0,
      };
    }

    const discountedUnitPrice = computeDiscountedPrice(
      product.harga_base,
      customer,
      product.tipe
    );
    const lineOmzet = computeLineOmzet(discountedUnitPrice, item.quantity);
    const lineLaba = computeLineLaba(discountedUnitPrice, product.harga_modal, item.quantity);

    return { item, product, discountedUnitPrice, lineOmzet, lineLaba };
  });

  const lineOmzets = computed.map((c) => c.lineOmzet);
  const lineLabas = computed.map((c) => c.lineLaba);

  return {
    items: computed,
    transactionOmzet: computeTransactionOmzet(lineOmzets),
    transactionLaba: computeTransactionLaba(lineLabas),
    amountOwed: computeTransactionOmzet(lineOmzets) + tx.ongkir,
  };
}
