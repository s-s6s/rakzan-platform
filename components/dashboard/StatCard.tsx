'use client';
interface StatCardProps {
  icon: React.ReactNode; label: string; value: string | number;
  sublabel?: string; trend?: { value: number; positive: boolean };
  color?: 'primary' | 'gold' | 'emerald' | 'amber' | 'red' | 'blue';
  onClick?: () => void; href?: string;
}

const colorClasses = {
  primary: 'bg-primary/5 text-primary border-primary/10',
  gold: 'bg-[#C9A84C]/5 text-[#C9A84C] border-[#C9A84C]/10',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
};

export function StatCard({ icon, label, value, sublabel, trend, color = 'primary' }: StatCardProps) {
  return (
    <div className='group relative overflow-hidden rounded-xl border bg-white p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20'>
      <div className='absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b' style={{ background: color === 'gold' ? 'linear-gradient(to bottom, #C9A84C, #A8882E)' : color === 'emerald' ? 'linear-gradient(to bottom, #10B981, #059669)' : `linear-gradient(to bottom, #1A2B72, #2A3B82)` }} />
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <p className='text-xs font-medium text-muted tracking-wide'>{label}</p>
          <p className='font-display text-2xl font-bold'>{value}</p>
          {sublabel && <p className='text-xs text-muted/70'>{sublabel}</p>}
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color]} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
          <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className='text-muted/60'>مقارنة بالشهر الماضي</span>
        </div>
      )}
    </div>
  );
}
