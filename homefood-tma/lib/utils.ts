export function formatPrice(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/,/g, ' ')} ₩`;
}

export function generateOrderNumber(): string {
  return `HF-${String(Date.now()).slice(-4)}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
