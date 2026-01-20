import {resolveDynamicEventProperties} from '../../render-nudge/common/action/AnalytictsEventAction'
import {triggerNativeEventViaEmitterAction} from '../../render-nudge/common/action/NativeEventEmitterAction'
import type {CTAEvent, CtaEventAction} from '../cta.interface'
import type {EventParamType} from '../cta.type'
import {sendRavenAppEvent} from '../ctaEvent'
import {timerMap} from '../ctaUtils'
import {NudgeAnalyticsEvents} from '../eventsFile'
import {StateMachine} from '../StateMachine'
import {setActionDone} from '../ctaHandler'

export function performCTAEventAction(
  appEvent: CTAEvent,
  currentAction: CtaEventAction,
  stateMachineId: string,
  stateMachine: StateMachine,
  prevState: string,
  ctaId: string,
) {
  setActionDone()
  const resolveParam = resolveDynamicEventProperties(
    currentAction.template?.eventParams ?? [],
    stateMachine.context,
  )
  const triggerDelayInMillis = currentAction?.config?.triggerDelay ?? 0
  if (triggerDelayInMillis > 0) {
    if (timerMap.has(ctaId)) {
      clearTimeout(timerMap.get(ctaId))
      timerMap.delete(ctaId)
    }

    const newTimer = setTimeout(
      triggerNativeEventViaEmitterAction,
      triggerDelayInMillis,
      currentAction.template.eventName,
      resolveParam,
    )
    timerMap.set(ctaId, newTimer)
  } else {
    triggerNativeEventViaEmitterAction(
      currentAction.template.eventName,
      resolveParam,
    )
  }

  sendNudgeCTAActionEvent(
    prevState,
    stateMachine.currentState,
    ctaId,
    appEvent.eventName,
    currentAction.template.eventName,
    resolveParam,
    stateMachineId,
  )
}

function sendNudgeCTAActionEvent(
  prevState: string,
  currentState: string,
  ctaId: string,
  eventName: string,
  nativeEmittedEventName: string,
  nativeEmittedEventParams: Record<string, EventParamType>,
  stateMachineId: string,
) {
  sendRavenAppEvent(NudgeAnalyticsEvents.NudgeCtaEventAction, {
    appEventName: eventName,
    ctaId: ctaId,
    stateMachineId: stateMachineId,
    currentState: currentState,
    prevState: prevState,
    emitEventName: nativeEmittedEventName,
    emitEventParams: JSON.stringify(nativeEmittedEventParams),
  })
}
