import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// globals: false 환경에선 Testing Library가 afterEach를 못 찾아 자동 cleanup이 안 된다
afterEach(cleanup)
