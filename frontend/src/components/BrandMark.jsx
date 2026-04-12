import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '../utils/cn'

const LOGO_SRC = '/brand/unlazy-mark.png'

export function BrandMark({ size = 40, className = '', rounded = 'xl', surface = 'brand' }) {
  const [hasError, setHasError] = useState(false)

  const roundedClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === '2xl'
        ? 'rounded-2xl'
        : rounded === 'lg'
          ? 'rounded-lg'
          : 'rounded-xl'

  const surfaceClass =
    surface === 'transparent'
      ? 'border-transparent bg-transparent shadow-none'
      : surface === 'neutral'
        ? 'border-neutral-200 bg-white shadow-[0_6px_14px_rgba(17,22,29,0.08)]'
        : 'border-white/20 bg-[#1f2d9c] shadow-[0_8px_20px_rgba(17,22,29,0.2)]'

  const overflowClass = surface === 'transparent' ? 'overflow-visible' : 'overflow-hidden'

  return (
    <div
      className={cn(
        'relative grid place-items-center border',
        overflowClass,
        surfaceClass,
        roundedClass,
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {!hasError ? (
        <img
          src={LOGO_SRC}
          alt="Unlazy logo"
          className="h-[74%] w-[74%] object-contain"
          style={{
            objectPosition: '50% 50%',
            transform: 'scale(1)',
            filter: 'saturate(1.08) brightness(1.04)',
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-white">
          <Sparkles size={Math.max(14, Math.round(size * 0.42))} />
        </div>
      )}
    </div>
  )
}

export function BrandWordmark({
  titleClassName = '',
  subtitleClassName = '',
  subtitle = 'Study smarter, stay consistent',
}) {
  return (
    <div>
      <p className={cn('font-heading text-2xl leading-tight text-neutral-900', titleClassName)}>Unlazy</p>
      <p className={cn('text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500', subtitleClassName)}>
        {subtitle}
      </p>
    </div>
  )
}
