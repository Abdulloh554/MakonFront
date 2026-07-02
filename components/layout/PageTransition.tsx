interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {children}
    </div>
  )
}
