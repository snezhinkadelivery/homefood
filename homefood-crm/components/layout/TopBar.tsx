'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';

export function TopBar() {
  const [open, setOpen] = useState(false);

  async function onLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-[#1E293B]"
          aria-label="Меню"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="text-sm font-bold text-[#1E293B]">HomeFood CRM</span>
        <button
          type="button"
          onClick={onLogout}
          className="text-xs font-medium text-[#64748B]"
        >
          Выйти
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
