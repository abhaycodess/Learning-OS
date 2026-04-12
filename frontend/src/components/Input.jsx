import { forwardRef } from 'react'
import { cn } from '../utils/cn.js'

const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'hover-lift w-full rounded-ui border border-neutral-200 bg-white px-s2 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        className,
      )}
      {...props}
    />
  )
})

export default Input
