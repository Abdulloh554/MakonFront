import { render, screen, fireEvent, act } from '@testing-library/react'
import ToastProvider, { useToast } from '@/components/ui/ToastProvider'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}))

function TestConsumer({ message, type }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const { showToast } = useToast()
  return <button onClick={() => showToast(message, type)}>Show Toast</button>
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders children', () => {
    renderWithProvider(<div data-testid="child">Child</div>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('shows toast when showToast is called', () => {
    renderWithProvider(<TestConsumer message="Hello" />)
    fireEvent.click(screen.getByText('Show Toast'))
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('shows toast with info type', () => {
    renderWithProvider(<TestConsumer message="Info toast" />)
    fireEvent.click(screen.getByText('Show Toast'))
    expect(screen.getByText('Info toast')).toBeInTheDocument()
  })

  it('shows toast with success type', () => {
    renderWithProvider(<TestConsumer message="Success!" type="success" />)
    fireEvent.click(screen.getByText('Show Toast'))
    expect(screen.getByText('Success!')).toBeInTheDocument()
  })

  it('shows toast with error type', () => {
    renderWithProvider(<TestConsumer message="Error!" type="error" />)
    fireEvent.click(screen.getByText('Show Toast'))
    expect(screen.getByText('Error!')).toBeInTheDocument()
  })

  it('auto-dismisses toast after 3500ms', () => {
    vi.useFakeTimers()
    renderWithProvider(<TestConsumer message="Auto dismiss" />)
    fireEvent.click(screen.getByText('Show Toast'))
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(3500) })

    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('removes toast on dismiss button click', () => {
    renderWithProvider(<TestConsumer message="Dismiss me" />)
    fireEvent.click(screen.getByText('Show Toast'))
    expect(screen.getByText('Dismiss me')).toBeInTheDocument()

    const dismissBtn = screen.getByRole('button', { name: '' })
    fireEvent.click(dismissBtn)

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument()
  })

  it('can show multiple toasts', () => {
    function MultiToastConsumer() {
      const { showToast } = useToast()
      return (
        <div>
          <button onClick={() => showToast('First')}>Show First</button>
          <button onClick={() => showToast('Second')}>Show Second</button>
        </div>
      )
    }
    renderWithProvider(<MultiToastConsumer />)
    fireEvent.click(screen.getByText('Show First'))
    fireEvent.click(screen.getByText('Show Second'))
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('useToast does not throw when used outside provider (returns default)', () => {
    function BadComponent() {
      useToast()
      return null
    }
    expect(() => render(<BadComponent />)).not.toThrow()
  })
})
