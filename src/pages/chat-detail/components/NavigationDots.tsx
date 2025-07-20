import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

type NavigationDotsProps = {
  totalEdits: number
  currentIndex: number
  onNavigate: ({ index }: { index: number }) => void
}

export function NavigationDots({
  totalEdits,
  currentIndex,
  onNavigate,
}: NavigationDotsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentIndex === 0}
        className="h-6 w-6 p-0 disabled:opacity-30"
        onClick={() => onNavigate({ index: currentIndex - 1 })}
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalEdits }, (_, index) => (
          <motion.button
            key={index}
            onClick={() => onNavigate({ index })}
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-colors duration-200',
              {
                'bg-primary': index === currentIndex,
                'bg-primary/60': index < currentIndex && index !== currentIndex,
                'bg-primary/20': index > currentIndex,
              }
            )}
            aria-label={`Edit ${index + 1}`}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              width: index === currentIndex ? '1rem' : '0.375rem',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 23,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={currentIndex === totalEdits - 1}
        className="h-6 w-6 p-0 disabled:opacity-30"
        onClick={() => onNavigate({ index: currentIndex + 1 })}
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  )
}
