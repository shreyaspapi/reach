import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'border-reach-blue/20 focus:border-reach-blue placeholder:text-reach-blue/40 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

