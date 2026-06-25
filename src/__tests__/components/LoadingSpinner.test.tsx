import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default text', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toContain('custom-spinner')
  })

  it('renders the spinner container', () => {
    const { container } = render(<LoadingSpinner />)
    const spinnerWrappers = container.querySelectorAll('.relative.w-10.h-10')
    expect(spinnerWrappers.length).toBeGreaterThan(0)
  })

  it('renders three dots', () => {
    const { container } = render(<LoadingSpinner />)
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots.length).toBeGreaterThanOrEqual(3)
  })
})
