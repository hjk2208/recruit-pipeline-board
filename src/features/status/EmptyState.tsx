interface Props {
  message: string
  /** 컬럼 안처럼 작게 보일 때 */
  compact?: boolean
}

export function EmptyState({ message, compact }: Props) {
  return (
    <p className={`text-center text-text-muted ${compact ? 'py-6 text-xs' : 'rounded-md border border-dashed border-border py-10 text-sm'}`}>
      {message}
    </p>
  )
}
