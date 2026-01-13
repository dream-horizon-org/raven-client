import {ActionType} from '../../../cta/cta.interface'

import type {RenderViewType} from './ViewTypes.interface'

export type RavenParams = {
  context: Record<string, unknown>
  data: RenderViewType | undefined
  isNudgeStreamingPreviewMode?: boolean
  actionType: ActionType
}
