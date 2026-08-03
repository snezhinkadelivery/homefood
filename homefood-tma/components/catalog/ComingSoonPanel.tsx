'use client';

type Props = {
  onOpenActive: () => void;
};

export function ComingSoonPanel({ onOpenActive }: Props) {
  return (
    <div className="mx-auto w-full max-w-[390px] px-4 py-5">
      <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-[#DBEAFE]">
        <div
          className="px-5 py-6 text-white"
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #16A34A 100%)' }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            🍱
          </div>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight">
            Реторт скоро вернётся
          </h2>
          <p className="mt-2 text-sm font-medium leading-5 text-white/90">
            Мы обновляем меню готовых блюд. Сейчас доступна заморозка HomeFood:
            удобно хранить, быстро разогреть, вкус как дома.
          </p>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div className="flex items-start gap-3 rounded-2xl bg-[#EFF6FF] px-4 py-3">
            <span className="text-xl">❄️</span>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">Заморозка уже в продаже</p>
              <p className="mt-0.5 text-xs leading-4 text-[#64748B]">
                Супы и вторые блюда по домашним рецептам.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenActive}
            className="h-12 w-full rounded-2xl bg-[#2563EB] text-sm font-extrabold text-white shadow-sm active:scale-[0.99]"
          >
            Перейти к заморозке
          </button>
        </div>
      </div>
    </div>
  );
}
