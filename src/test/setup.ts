import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// globals: false 환경에선 Testing Library가 afterEach를 못 찾아 자동 cleanup이 안 된다
afterEach(cleanup)

// jsdom에는 matchMedia가 없다. 기본은 데스크톱(md 이상)으로 두고, 모바일이 필요한 테스트가 덮어쓴다
beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})
