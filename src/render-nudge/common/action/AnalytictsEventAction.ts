import type {EventParamType} from '../../../cta/cta.type'
import {sendNudgeAppEvent} from '../../../cta/ctaEvent'
import {resolveProp} from '../../screens/NudgeScreen/utils/StringUtils'

import type {
  AnalyticsEventActionProps,
  DynamicArray,
} from './ActionType.interface'

export function triggerAnalyticsEventAction(
  props: AnalyticsEventActionProps,
  context: Record<string, unknown>,
) {
  const resolvedProps = resolveDynamicEventProperties(
    props.params.eventParams,
    context,
  )
  sendNudgeAppEvent(props.params.eventName, resolvedProps)
}

export function resolveDynamicEventProperties(
  eventParams: DynamicArray[],
  context: Record<string, unknown>,
): Record<string, EventParamType> {
  const resolveParam: Record<string, EventParamType> = {}
  eventParams.forEach((eventParam) => {
    resolveParam[eventParam.name] = resolveProp<EventParamType>(
      eventParam.value,
      context,
      eventParam.type,
    )
  })
  return resolveParam
}
