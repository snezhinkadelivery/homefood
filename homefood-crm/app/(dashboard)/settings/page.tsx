import { supabaseAdmin } from '@/lib/supabase-admin';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { ToastViewport } from '@/components/ui/Toast';

export const dynamic = 'force-dynamic';

type Row = { key: string; value: string };

export default async function SettingsPage() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('key, value')
    .in('key', ['delivery_phone', 'bank_name', 'bank_account', 'bank_holder']);

  const map: Record<string, string> = {};
  ((data ?? []) as Row[]).forEach((r) => {
    map[r.key] = r.value;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Настройки</h1>
        <p className="text-sm text-[#64748B]">Контакты и реквизиты</p>
      </div>

      <SettingsForm
        initial={{
          delivery_phone: map.delivery_phone ?? '',
          bank_name: map.bank_name ?? '',
          bank_account: map.bank_account ?? '',
          bank_holder: map.bank_holder ?? '',
        }}
      />

      <ToastViewport />
    </div>
  );
}
