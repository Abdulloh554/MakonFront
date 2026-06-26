import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function PropertyDetailLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  )
}
