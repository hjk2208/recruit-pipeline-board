import { STAGES } from '../../api'
import { CandidateCard } from '../candidate-card/CandidateCard'
import { BoardColumn } from './BoardColumn'
import { groupByStage } from './groupByStage'
import { useCandidates } from './useCandidates'

export function Board() {
  const byStage = groupByStage(useCandidates())
  return (
    <div className="flex min-h-0 flex-1 snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
      {STAGES.map((stage) => (
        <BoardColumn key={stage} stage={stage} count={byStage[stage].length}>
          {byStage[stage].map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </BoardColumn>
      ))}
    </div>
  )
}
