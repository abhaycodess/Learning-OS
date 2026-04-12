const ProgressCard = ({ subject, progress = 0, taskCount = 0 }) => {
  const colorMap = {
    Math: {
      surface: 'bg-[linear-gradient(135deg,#f8fbfa_0%,#f0f8f5_50%,#ffffff_100%)]',
      bar: 'bg-gradient-to-r from-emerald-400 to-teal-400',
      chip: 'border-emerald-200/70 bg-emerald-100/70 text-emerald-700',
      track: 'bg-emerald-100/65',
    },
    Physics: {
      surface: 'bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_50%,#ffffff_100%)]',
      bar: 'bg-gradient-to-r from-sky-400 to-blue-400',
      chip: 'border-sky-200/70 bg-sky-100/70 text-sky-700',
      track: 'bg-sky-100/65',
    },
    Chemistry: {
      surface: 'bg-[linear-gradient(135deg,#fff9fb_0%,#fff0f6_50%,#ffffff_100%)]',
      bar: 'bg-gradient-to-r from-rose-400 to-pink-400',
      chip: 'border-rose-200/70 bg-rose-100/70 text-rose-700',
      track: 'bg-rose-100/65',
    },
    Biology: {
      surface: 'bg-[linear-gradient(135deg,#f9fcf7_0%,#f3faef_50%,#ffffff_100%)]',
      bar: 'bg-gradient-to-r from-lime-400 to-green-400',
      chip: 'border-lime-200/70 bg-lime-100/70 text-lime-700',
      track: 'bg-lime-100/65',
    },
    English: {
      surface: 'bg-[linear-gradient(135deg,#faf9ff_0%,#f1efff_50%,#ffffff_100%)]',
      bar: 'bg-gradient-to-r from-primary to-primary-light',
      chip: 'border-primary/20 bg-primary/10 text-primary',
      track: 'bg-primary/10',
    },
    History: {
      surface: 'bg-[linear-gradient(135deg,#fffbf5_0%,#fff5e8_50%,#ffffff_100%)]',
      bar: 'bg-gradient-to-r from-amber-400 to-orange-400',
      chip: 'border-amber-200/70 bg-amber-100/70 text-amber-700',
      track: 'bg-amber-100/65',
    },
  }

  const palette = colorMap[subject] || {
    surface: 'bg-[linear-gradient(135deg,#f9faff_0%,#f1f4ff_50%,#ffffff_100%)]',
    bar: 'bg-gradient-to-r from-primary to-primary-light',
    chip: 'border-primary/20 bg-primary/10 text-primary',
    track: 'bg-primary/10',
  }

  return (
    <div className={`animate-fade-up rounded-xl border border-stone-200 p-4 transition-all duration-200 hover:shadow-md ${palette.surface}`}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-heading text-lg font-medium text-stone-900">{subject}</h3>
          <p className="text-xs text-stone-500">{taskCount} tasks</p>
        </div>
        <div className={`rounded-lg border px-2 py-1 text-sm font-semibold ${palette.chip}`}>
          {progress}%
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-1.5 w-full overflow-hidden rounded-full ${palette.track}`}>
        <div
          className={`h-full ${palette.bar} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressCard
