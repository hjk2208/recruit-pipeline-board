import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom에는 레이아웃이 없어 가상 스크롤이 0개를 그린다. 테스트에선 전부 렌더하는 fake로 바꾸고,
// 가상화 동작(창 크기·scrollToIndex)은 브라우저에서 측정으로 검증한다.
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (i: number) => number }) => ({
    getVirtualItems: () => Array.from({ length: count }, (_, index) => ({ index, key: index, start: index * estimateSize(index), size: estimateSize(index) })),
    getTotalSize: () => count * estimateSize(0),
    measureElement: () => {},
    scrollToIndex: () => {},
  }),
}))

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

// jsdom에는 ResizeObserver·Element.scrollTo가 없다 — 가상 스크롤(TanStack Virtual)이 쓴다
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in window)) (window as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
