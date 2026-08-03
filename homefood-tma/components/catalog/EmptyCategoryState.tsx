'use client';

type Props = {
  categoryName?: string;
};

export function EmptyCategoryState({ categoryName }: Props) {
  const isSauces = categoryName?.toLowerCase().includes('подлив');

  return (
    <div className="w-full px-4">
      <div className="mx-auto max-w-[390px] rounded-[24px] bg-white p-6 text-center shadow-sm ring-1 ring-[#E2E8F0]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-2xl">
          {isSauces ? '🥘' : '🍽️'}
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-[#1E293B]">
          {isSauces ? 'Подливы скоро появятся' : 'В этой категории пока нет блюд'}
        </h2>
        <p className="mt-2 text-sm leading-5 text-[#64748B]">
          {isSauces
            ? 'Мы добавим их в меню чуть позже. Пока можно выбрать супы и вторые блюда из заморозки.'
            : 'Загляните в другие категории HomeFood.'}
        </p>
      </div>
    </div>
  );
}
