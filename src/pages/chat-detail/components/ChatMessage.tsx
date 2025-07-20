import type { ReactNode } from 'react'

import { ConditionalTooltip } from '@/components/ui/conditional-tooltip'
import { cn } from '@/lib/utils'

type ChatMessageProps = {
  icon: ReactNode
  label: string
  text: string
  shouldShowTooltip?: boolean
  iconContainerClassName?: string
}

export function ChatMessage({
  icon,
  label,
  text,
  shouldShowTooltip = true,
  iconContainerClassName,
}: ChatMessageProps) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          'bg-muted flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
          iconContainerClassName
        )}
      >
        {icon}
      </div>
      <div className="flex max-w-[600px] min-w-0 flex-1 flex-col">
        <p className="text-foreground text-xs font-medium">{label}</p>
        <ConditionalTooltip
          showTooltip={shouldShowTooltip}
          tooltipContent={text}
          side="top"
          delayDuration={1000}
        >
          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
            {text}
          </p>
        </ConditionalTooltip>
      </div>
    </div>
  )
}
