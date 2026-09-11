export const STAGES = ['서류검토', '면접', '처우협의', '최종합격', '불합격'] as const
export type Stage = (typeof STAGES)[number]

export const ROLES = ['프론트엔드', '백엔드', '디자인', 'PM', '데이터'] as const
export type Role = (typeof ROLES)[number]

export interface Candidate {
  id: string
  name: string
  role: Role
  /** YYYY-MM-DD */
  appliedAt: string
  stage: Stage
  email: string
  phone: string
  /** 지원 동기 한 줄 — 상세 패널용 */
  memo: string
  /** ISO 문자열. 경쟁 상태 처리 시 기준값 */
  updatedAt: string
}
