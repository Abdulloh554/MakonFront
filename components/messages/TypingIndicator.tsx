'use client'

interface TypingIndicatorProps {
  name: string
}

export default function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium">{name}</span>
        <span className="text-xs">yozmoqda</span>
      </div>
      <div className="typing-indicator flex items-center gap-[3px]">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
