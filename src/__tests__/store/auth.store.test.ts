import { useAuthStore } from '@/store/auth.store'
import { authApi, setCsrfToken, clearCsrfToken } from '@/services/api'

vi.mock('@/services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
  setCsrfToken: vi.fn(),
  clearCsrfToken: vi.fn(),
  getCsrfToken: vi.fn(() => null),
}))

const mockUser = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  phone: '+998901234567',
  avatar: '',
  role: 'user' as const,
  isActive: true,
  isVerified: true,
  provider: 'local' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('auth.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      csrfToken: null,
      isLoading: true,
      isAuthenticated: false,
    })
  })

  it('has correct initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.csrfToken).toBeNull()
    expect(state.isLoading).toBe(true)
    expect(state.isAuthenticated).toBe(false)
  })

  it('setUser updates user and sets isAuthenticated', () => {
    useAuthStore.getState().setUser(mockUser)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('setUser with null clears user and isAuthenticated', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setUser(null)
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setCsrfToken calls setCsrfToken API and updates state', () => {
    useAuthStore.getState().setCsrfToken('token-123')
    expect(setCsrfToken).toHaveBeenCalledWith('token-123')
    const state = useAuthStore.getState()
    expect(state.csrfToken).toBe('token-123')
  })

  it('setCsrfToken with null calls clearCsrfToken', () => {
    useAuthStore.getState().setCsrfToken(null)
    expect(clearCsrfToken).toHaveBeenCalled()
    const state = useAuthStore.getState()
    expect(state.csrfToken).toBeNull()
  })

  it('login calls API and updates state', async () => {
    const mockLoginResponse = { user: mockUser, csrfToken: 'csrf-123' }
    vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse)

    await useAuthStore.getState().login('+998901234567', 'password')

    expect(authApi.login).toHaveBeenCalledWith('+998901234567', 'password')
    expect(setCsrfToken).toHaveBeenCalledWith('csrf-123')
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
  })

  it('register calls API and updates state', async () => {
    const mockRegisterResponse = { user: mockUser, csrfToken: 'csrf-456' }
    vi.mocked(authApi.register).mockResolvedValue(mockRegisterResponse)

    await useAuthStore.getState().register('John', 'Doe', '+998901234567', 'password')

    expect(authApi.register).toHaveBeenCalledWith('John', 'Doe', '+998901234567', 'password')
    expect(setCsrfToken).toHaveBeenCalledWith('csrf-456')
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('logout clears user and calls clearCsrfToken', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, csrfToken: 'token' })

    await useAuthStore.getState().logout()

    expect(authApi.logout).toHaveBeenCalled()
    expect(clearCsrfToken).toHaveBeenCalled()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.csrfToken).toBeNull()
  })

  it('logout proceeds even if API fails', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'))
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, csrfToken: 'token' })

    await useAuthStore.getState().logout()

    expect(clearCsrfToken).toHaveBeenCalled()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
  })

  it('restoreSession fetches user from me endpoint', async () => {
    vi.mocked(authApi.me).mockResolvedValue(mockUser)

    await useAuthStore.getState().restoreSession()

    expect(authApi.me).toHaveBeenCalled()
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
  })

  it('restoreSession handles error gracefully', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error('Unauthorized'))

    await useAuthStore.getState().restoreSession()

    expect(clearCsrfToken).toHaveBeenCalled()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('setLoading updates loading state', () => {
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})
