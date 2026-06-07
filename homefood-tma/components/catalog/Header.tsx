'use client';

import { useTelegram } from '@/hooks/useTelegram';

export function Header() {
  const { user } = useTelegram();
  const initial = (user?.first_name ?? 'U').charAt(0).toUpperCase();

  return (
    <header
      className="relative flex h-20 items-center justify-between px-4"
      style={{
        background: 'linear-gradient(90deg, #2563EB 0%, #16A34A 100%)',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
      }}
    >
      {/* Лого слева */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://ismabdzoywtfcthfkggp.supabase.co/storage/v1/object/public/images_logo/logo.jpeg"
        alt="HomeFood"
        width={56}
        height={56}
        className="h-14 w-14 rounded-full object-cover ring-2 ring-white/50"
      />

      {/* Название по центру экрана */}
      <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center leading-tight">
        <h1 className="text-[22px] font-extrabold text-white">HomeFood</h1>
        <p className="text-[12px] font-semibold text-white/85">
          Домашняя еда с доставкой
        </p>
      </div>

      {/* Аватар пользователя справа — только отображение */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/50"
        aria-label="Профиль"
      >
        {user?.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photo_url}
            alt={user.first_name ?? 'Профиль'}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-base font-extrabold text-white">{initial}</span>
        )}
      </div>
    </header>
  );
}
