import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from './cn';

const fieldBase =
  'w-full rounded-2xl bg-white/65 backdrop-blur-md border border-white/70 text-ink-800 placeholder-ink-400 ' +
  'shadow-glass-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-azure-400/50 ' +
  'focus:border-azure-300 focus:bg-white/90 disabled:opacity-60';

/** Optional label + field wrapper. */
export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-coral-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export const GlassInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function GlassInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, 'px-4 py-3', className)} {...props} />;
  },
);

export const GlassTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function GlassTextarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, 'px-4 py-3 resize-y min-h-[120px]', className)} {...props} />;
  },
);

export const GlassSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function GlassSelect({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(fieldBase, 'px-4 py-3 pr-10 appearance-none cursor-pointer', className)} {...props}>
        {children}
      </select>
    );
  },
);

export default GlassInput;
