type Props = {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
};

const COLORS: Record<Props['color'], string> = {
  blue: 'bg-[#DBEAFE] text-[#2563EB]',
  green: 'bg-[#DCFCE7] text-[#16A34A]',
  yellow: 'bg-[#FEF3C7] text-[#CA8A04]',
  purple: 'bg-[#EDE9FE] text-[#7C3AED]',
};

export function MetricCard({ title, value, subtitle, icon, color }: Props) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold text-[#1E293B]">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${COLORS[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
