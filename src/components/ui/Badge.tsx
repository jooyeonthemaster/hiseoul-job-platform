import type { ReactNode } from 'react';
import { cn } from './cn';

type Tone = 'azure' | 'mint' | 'honey' | 'coral' | 'neutral';

const tones: Record<Tone, string> = {
  azure: 'bg-azure-50 text-azure-700 border-azure-200',
  mint: 'bg-mint-100 text-mint-600 border-mint-400/40',
  honey: 'bg-honey-100 text-honey-600 border-honey-400/40',
  coral: 'bg-coral-100 text-coral-600 border-coral-400/40',
  neutral: 'bg-ink-50 text-ink-600 border-ink-200',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}

/** Small status / category pill. */
export function Badge({ children, tone = 'azure', className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export default Badge;
