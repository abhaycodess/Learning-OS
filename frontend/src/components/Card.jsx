import { cn } from '../utils/cn.js'

const tones = {
  default: 'surface',
  soft: 'surface-soft',
}

export default function Card({ className, children, tone = 'default' }) {
  return (
    <section className={cn(tones[tone], 'hover-lift hover-bloom p-s3 animate-fade-up', className)}>
      {children}
    </section>
  )
}
