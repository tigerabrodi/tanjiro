import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type ChatMessageProps = {
  icon: ReactNode
  label: string
  text: string
  iconContainerClassName?: string
}

export function ChatMessage({
  icon,
  label,
  text,
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
        <p className="text-muted-foreground text-xs leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
