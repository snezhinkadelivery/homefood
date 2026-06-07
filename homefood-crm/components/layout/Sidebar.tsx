'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', icon: '📊', label: 'Аналитика' },
  { href: '/orders', icon: '📦', label: 'Заказы' },
  { href: '/catalog', icon: '🍽️', label: 'Каталог' },
  { href: '/reviews', icon: '⭐', label: 'Отзывы' },
  { href: '/settings', icon: '⚙️', label: 'Настройки' },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[#1E293B] text-[#94A3B8]">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
        <Image
          src="/logo.jpeg"
          alt="HomeFood"
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div className="leading-tight">
          <p className="text-base font-bold text-white">HomeFood</p>
          <p className="text-[11px] uppercase tracking-wider text-[#94A3B8]">CRM</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4">
        {NAV.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={
                'relative mb-1 flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition ' +
                (active
                  ? 'bg-white/5 text-white'
                  : 'text-[#94A3B8] hover:bg-white/5 hover:text-white')
              }
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r"
                  style={{ background: '#2563EB' }}
                />
              )}
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-5 py-3 text-[11px] text-[#64748B]">
        HomeFood CRM v1.0
      </div>
    </aside>
  );
}
