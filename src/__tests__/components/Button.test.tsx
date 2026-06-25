import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/ui/Button'

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('from-blue-600')
    expect(btn?.className).toContain('to-indigo-600')
  })

  it('applies secondary variant classes', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('border-2')
    expect(btn?.className).toContain('border-blue-600')
  })

  it('applies ghost variant classes', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('text-gray-600')
    expect(btn?.className).toContain('hover:bg-gray-100')
  })

  it('applies sm size classes', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('px-3')
    expect(btn?.className).toContain('py-1.5')
    expect(btn?.className).toContain('text-xs')
  })

  it('applies md size classes by default', () => {
    const { container } = render(<Button>Medium</Button>)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('px-4')
    expect(btn?.className).toContain('py-2.5')
  })

  it('applies lg size classes', () => {
    const { container } = render(<Button size="lg">Large</Button>)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('w-full')
    expect(btn?.className).toContain('py-3')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner and text when loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByText('Saqlanmoqda...')).toBeInTheDocument()
    expect(screen.getByText('Saqlanmoqda...').closest('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    await user.click(screen.getByText('Disabled'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<Button loading onClick={handleClick}>Loading</Button>)
    await user.click(screen.getByText('Saqlanmoqda...'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with icon', () => {
    render(<Button icon={<span data-testid="test-icon">*</span>}>Icon</Button>)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('passes type attribute', () => {
    const { container } = render(<Button type="submit">Submit</Button>)
    const btn = container.querySelector('button')
    expect(btn?.type).toBe('submit')
  })

  it('applies additional className', () => {
    const { container } = render(<Button className="custom-class">Extra</Button>)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('custom-class')
  })
})
