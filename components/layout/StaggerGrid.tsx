interface StaggerGridProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return <div className="animate-stagger-item">{children}</div>
}

export default function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
