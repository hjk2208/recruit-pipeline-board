import { ROLES, STAGES, type Candidate, type Role, type Stage } from '../types'

/** mulberry32 — 시드가 같으면 항상 같은 수열. 테스트 재현용 */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권']
const GIVEN = ['서준', '지우', '하은', '도윤', '민서', '예준', '수아', '시우', '지아', '주원', '하린', '유준', '채원', '준서', '지민', '은우', '서윤', '현우', '다은', '지호']

// 단계별 가중치 — 초반 단계에 지원자가 몰려 있는 게 자연스럽다
const STAGE_WEIGHTS: Record<Stage, number> = {
  서류검토: 40,
  면접: 25,
  처우협의: 10,
  최종합격: 10,
  불합격: 15,
}

const MEMOS = [
  '사용자 경험을 개선하는 일에 관심이 많습니다.',
  '팀과 함께 성장하는 환경을 찾고 있습니다.',
  '데이터 기반 의사결정 문화에 기여하고 싶습니다.',
  '제품의 초기 단계부터 참여해보고 싶습니다.',
  '기술 부채를 줄이는 리팩토링 경험이 있습니다.',
  '디자인 시스템 구축 경험을 살리고 싶습니다.',
]

function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.floor(r * arr.length)]
}

function pickWeighted(r: number): Stage {
  const total = Object.values(STAGE_WEIGHTS).reduce((a, b) => a + b, 0)
  let acc = r * total
  for (const stage of STAGES) {
    acc -= STAGE_WEIGHTS[stage]
    if (acc < 0) return stage
  }
  return STAGES[STAGES.length - 1]
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export interface SeedOptions {
  count?: number
  seed?: number
  /** 지원일 기준일. 기본 2026-09-11 — 결정적 출력을 위해 고정 */
  today?: Date
}

export function generateCandidates({
  count = 250,
  seed = 20260911,
  today = new Date('2026-09-11T00:00:00Z'),
}: SeedOptions = {}): Candidate[] {
  const random = createRandom(seed)
  const out: Candidate[] = []
  for (let i = 0; i < count; i++) {
    const name = pick(SURNAMES, random()) + pick(GIVEN, random())
    const role: Role = pick(ROLES, random())
    const daysAgo = Math.floor(random() * 90)
    const applied = new Date(today.getTime() - daysAgo * 86_400_000)
    const id = `c${String(i + 1).padStart(4, '0')}`
    out.push({
      id,
      name,
      role,
      appliedAt: toDateString(applied),
      stage: pickWeighted(random()),
      email: `${id}@example.com`,
      phone: `010-${String(1000 + Math.floor(random() * 9000))}-${String(1000 + Math.floor(random() * 9000))}`,
      memo: pick(MEMOS, random()),
      updatedAt: applied.toISOString(),
    })
  }
  return out
}
