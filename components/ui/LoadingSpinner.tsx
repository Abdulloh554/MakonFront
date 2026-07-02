interface LoadingSpinnerProps {
  text?: string
  className?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ text = 'Yuklanmoqda...', className = '', fullScreen }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label={text} className={`${fullScreen ? 'fixed inset-0 z-50 bg-white/80 flex items-center justify-center' : 'flex-1 flex items-center justify-center'} ${className}`}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, transparent 70%, #185FA5 100%)',
            }}
          />
          <div className="absolute inset-0.5 rounded-full bg-white" />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #185FA5, #378ADD)',
              opacity: 0.1,
            }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full loading-dot"
              style={{ background: '#94a3b8', animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <p className="text-sm font-medium text-slate-400">{text}</p>
      </div>
    </div>
  )
}
