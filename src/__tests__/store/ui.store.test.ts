import { useUiStore } from '@/store/ui.store'

describe('ui.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    useUiStore.setState({
      sidebarOpen: false,
      mobileNavOpen: false,
      activeModal: null,
      modalData: null,
      toasts: [],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('has correct initial state', () => {
    const state = useUiStore.getState()
    expect(state.sidebarOpen).toBe(false)
    expect(state.mobileNavOpen).toBe(false)
    expect(state.activeModal).toBeNull()
    expect(state.modalData).toBeNull()
    expect(state.toasts).toEqual([])
  })

  it('toggleSidebar toggles sidebar open state', () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(true)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it('setSidebarOpen sets sidebar state', () => {
    useUiStore.getState().setSidebarOpen(true)
    expect(useUiStore.getState().sidebarOpen).toBe(true)
    useUiStore.getState().setSidebarOpen(false)
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it('setMobileNavOpen sets mobile nav state', () => {
    useUiStore.getState().setMobileNavOpen(true)
    expect(useUiStore.getState().mobileNavOpen).toBe(true)
    useUiStore.getState().setMobileNavOpen(false)
    expect(useUiStore.getState().mobileNavOpen).toBe(false)
  })

  it('openModal sets activeModal and modalData', () => {
    useUiStore.getState().openModal('login-modal', { userId: '123' })
    expect(useUiStore.getState().activeModal).toBe('login-modal')
    expect(useUiStore.getState().modalData).toEqual({ userId: '123' })
  })

  it('openModal sets modalData to undefined when not provided', () => {
    useUiStore.getState().openModal('signup-modal')
    expect(useUiStore.getState().activeModal).toBe('signup-modal')
    expect(useUiStore.getState().modalData).toBeUndefined()
  })

  it('closeModal clears activeModal and modalData', () => {
    useUiStore.setState({ activeModal: 'login-modal', modalData: { id: 1 } })
    useUiStore.getState().closeModal()
    expect(useUiStore.getState().activeModal).toBeNull()
    expect(useUiStore.getState().modalData).toBeNull()
  })

  it('addToast adds a toast with auto-generated id', () => {
    useUiStore.getState().addToast({ type: 'success', message: 'Operation completed' })
    const toasts = useUiStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Operation completed')
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].id).toMatch(/^toast_\d+$/)
  })

  it('addToast with different types', () => {
    useUiStore.getState().addToast({ type: 'error', message: 'Error occurred' })
    useUiStore.getState().addToast({ type: 'info', message: 'Info message' })
    useUiStore.getState().addToast({ type: 'warning', message: 'Warning' })
    const toasts = useUiStore.getState().toasts
    expect(toasts).toHaveLength(3)
    expect(toasts[0].type).toBe('error')
    expect(toasts[1].type).toBe('info')
    expect(toasts[2].type).toBe('warning')
  })

  it('addToast auto-dismisses after default duration (5000ms)', () => {
    useUiStore.getState().addToast({ type: 'info', message: 'Auto dismiss' })
    expect(useUiStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(5000)

    expect(useUiStore.getState().toasts).toHaveLength(0)
  })

  it('addToast auto-dismisses after custom duration', () => {
    useUiStore.getState().addToast({ type: 'info', message: 'Custom duration', duration: 2000 })
    expect(useUiStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(1999)
    expect(useUiStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(useUiStore.getState().toasts).toHaveLength(0)
  })

  it('removeToast removes a toast by id', () => {
    useUiStore.getState().addToast({ type: 'info', message: 'Toast 1' })
    useUiStore.getState().addToast({ type: 'success', message: 'Toast 2' })
    const firstId = useUiStore.getState().toasts[0].id

    useUiStore.getState().removeToast(firstId)
    const remaining = useUiStore.getState().toasts
    expect(remaining).toHaveLength(1)
    expect(remaining[0].message).toBe('Toast 2')
  })
})
