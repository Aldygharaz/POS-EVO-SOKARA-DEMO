import type { ReactNode } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';

interface AppTooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  /** Optional keyboard shortcut badge */
  shortcut?: string;
  /** Wider max-width for longer descriptions */
  wide?: boolean;
  /** Disable tooltip (renders children only) */
  disabled?: boolean;
}

/**
 * AppTooltip - Ergonomic wrapper for the premium tooltip system.
 *
 * Usage:
 * <AppTooltip content="Dashboard" shortcut="D">
 *   <button><HomeIcon /></button>
 * </AppTooltip>
 */
export default function AppTooltip({
  children,
  content,
  side = 'right',
  align = 'center',
  shortcut,
  wide = false,
  disabled = false,
}: AppTooltipProps) {
  if (disabled || !content) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className={wide ? 'max-w-xs' : undefined}
      >
        <div className="flex items-center gap-2">
          <span>{content}</span>
          {shortcut && (
            <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded bg-slate-700/60 dark:bg-slate-600/60 border border-slate-600/40 dark:border-slate-500/40 text-[10px] font-mono font-semibold text-slate-300 tracking-wide shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)]">
              {shortcut}
            </kbd>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
