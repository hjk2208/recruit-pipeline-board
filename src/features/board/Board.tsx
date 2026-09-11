import { STAGES } from '../../api'
import { BoardColumn } from './BoardColumn'
import { groupByStage } from './groupByStage'
import { useCandidates } from './useCandidates'

export function Board() {
  const byStage = groupByStage(useCandidates())
  return (
    <div className="flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
      {STAGES.map((stage) => (
        <BoardColumn key={stage} stage={stage} count={byStage[stage].length} />
      ))}
    </div>
  )
}
