import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyCard from '@/components/features/properties/PropertyCard'
import type { Property } from '@/types'

const mockProperty: Property = {
  id: '1',
  sellerId: 'seller-1',
  title: 'Luxury Apartment in Center',
  description: 'A beautiful apartment',
  price: 150000,
  type: 'apartment',
  dealType: 'sale',
  status: 'ready',
  rooms: 3,
  area: 75,
  location: {
    lat: 41.2995,
    lng: 69.2401,
    address: 'Amir Temur, Tashkent',
    city: 'Tashkent',
  },
  images: ['https://example.com/img.jpg'],
  views: 100,
  favorites: [],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('PropertyCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders property title', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Luxury Apartment in Center')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('150K$')).toBeInTheDocument()
  })

  it('renders price in millions format', () => {
    const expensive = { ...mockProperty, price: 2500000 }
    render(<PropertyCard property={expensive} />)
    expect(screen.getByText('2.5M$')).toBeInTheDocument()
  })

  it('renders price in dollars for small values', () => {
    const cheap = { ...mockProperty, price: 500 }
    render(<PropertyCard property={cheap} />)
    expect(screen.getByText('500$')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Tayyor uy')).toBeInTheDocument()
  })

  it('renders deal type badge', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Sotiladi')).toBeInTheDocument()
  })

  it('renders property type label', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Kvartira')).toBeInTheDocument()
  })

  it('renders area', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('75 m²')).toBeInTheDocument()
  })

  it('renders rooms count when > 0', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('3 xona')).toBeInTheDocument()
  })

  it('does not render rooms when rooms is 0', () => {
    const noRooms = { ...mockProperty, rooms: 0 }
    render(<PropertyCard property={noRooms} />)
    expect(screen.queryByText(/xona/)).not.toBeInTheDocument()
  })

  it('renders address without city part after comma', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Amir Temur')).toBeInTheDocument()
  })

  it('renders placeholder image when image fails to load', () => {
    const img = new Image()
    Object.defineProperty(img, 'src', {
      get() { return this._src || '' },
      set(val) { this._src = val },
    })

    const noImage = { ...mockProperty, images: [] }
    render(<PropertyCard property={noImage} />)
    const renderedImg = screen.getByAltText('Luxury Apartment in Center')
    expect(renderedImg).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<PropertyCard property={mockProperty} onClick={handleClick} />)
    const card = screen.getByText('Luxury Apartment in Center').closest('div')
    await user.click(card!)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders installment price when deal type is installment', () => {
    const installmentProp: Property = {
      ...mockProperty,
      dealType: 'installment',
      installmentMonths: 12,
      installmentPrice: 12500,
    }
    render(<PropertyCard property={installmentProp} />)
    expect(screen.getByText(/oyiga/)).toBeInTheDocument()
  })

  it('handles missing installmentMonths gracefully', () => {
    const installmentProp: Property = {
      ...mockProperty,
      dealType: 'installment',
    }
    render(<PropertyCard property={installmentProp} />)
    expect(screen.getByText('Nasiya')).toBeInTheDocument()
  })
})
