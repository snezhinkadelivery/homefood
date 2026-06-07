import type { Period } from '@/types';

export function formatPrice(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/,/g, ' ')} ₩`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function periodStart(period: Period): string | null {
  if (period === 'all') return null;
  const now = new Date();
  if (period === 'today') {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  // month
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}
