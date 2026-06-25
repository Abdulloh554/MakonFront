<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:testing-infrastructure -->
# Testing Configuration

## Commands
- `npm test` — run all tests
- `npm run test:watch` — watch mode
- `npm run test:coverage` — run with coverage report

## Conventions
- All test files in `src/__tests__/`, mirrors source structure (`components/`, `store/`, `services/`, `queries/`)
- Uses vitest globals — no imports needed for `describe`, `it`, `expect`, `vi`
- Mock imports with `vi.mock()` (not `jest.mock()`)
- Reset module state between test groups with `vi.resetModules()` + `import()` for fresh references
- Reset mock function state with `vi.resetAllMocks()` in `beforeEach` (clears `mockResolvedValueOnce` queue — `clearAllMocks()` does NOT)
- Use `fireEvent` from `@testing-library/react` for click/change events (avoids `userEvent` incompatibility with fake timers)
- Mock `framer-motion` with `AnimatePresence: ({ children }) => <>{children}</>` + passthrough `motion.div` in component tests to prevent animation DOM artifacts
- Zustand stores tested by direct import (no mocking)
- API tests mock `globalThis.fetch` with `vi.fn()`; use `mockResolvedValue` (persistent) and `mockResolvedValueOnce` (one-shot)
- Coverage: v8 provider, 80% threshold on branches/functions/lines/statements, only tracked files are checked (see `vitest.config.ts` `coverage.include`)

## Coverage (tracked files)
| File | Branch | Func | Line |
|------|--------|------|------|
| services/api.ts | 94% | 100% | 98% |
| services/admin.ts | 82% | 100% | 97% |
| store/* | 100% | 100% | 100% |
| queries/property.queries.ts | 67% | 88% | 89% |
| components/ui/* | 95% | 94% | 100% |
| PropertyCard.tsx | 86% | 67% | 91% |

## Key Patterns
- **ToastProvider**: Must mock `framer-motion` in test file. Mock `motion.div` to plain `<div>`. Mock `AnimatePresence` to fragment.
- **API tests**: Use `freshApi()` helper that calls `vi.resetModules()` then `import('@/services/api')` per test group to isolate module-level state (`csrfToken`, `isRefreshing`). Call `vi.resetAllMocks()` in top-level `beforeEach` to avoid stale `mockResolvedValueOnce` queues leaking between tests.
- **401 auto-refresh**: Use `messageApi.conversations()` (no `skipAuth`) rather than `propertyApi.detail()` (has `skipAuth: true`).
- **PropertyCard**: Map type (`PropertyMapItem`) has no `installmentMonths` — check for "Nasiya" badge text.
- **Admin non-JSON error**: `catch` uses `res.statusText` as fallback message.
<!-- END:testing-infrastructure -->
