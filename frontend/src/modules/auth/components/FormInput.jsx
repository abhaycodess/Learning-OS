import { AlertCircle } from 'lucide-react'

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  rightElement,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-stone-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus-visible:ring-offset-0 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-500 bg-red-50'
              : 'border-stone-200 focus:ring-purple-100 focus:border-[#6352c8]'
          }`}
          style={{
            ringColor: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 82, 200, 0.1)',
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div
          id={`${name}-error`}
          className="mt-2 flex items-center gap-2 text-sm text-red-600"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
