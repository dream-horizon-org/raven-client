import {CTA} from '../Cta'
import {StateMachine} from '../StateMachine'
import type {CTAEvent, CtaPopupAction, CtaUIAction} from '../cta.interface'
import {showNudgeFromPrefetchedTemplate} from '../ctaUtils'
import {setActionDone} from '../ctaHandler'

export function performCTANudgeAction(
  stateMachine: StateMachine,
  appEvent: CTAEvent,
  stateMachineId: string,
  prevState: string,
  currentAction: CtaUIAction | CtaPopupAction,
  cta: CTA,
) {
  if (stateMachine.hasValidateContextParams(cta)) {
    setActionDone()
    const eventObj = {
      appEventName: appEvent.eventName,
      ctaId: cta.id,
      stateMachineId: stateMachineId,
      currentState: stateMachine.currentState,
      prevState,
      templateId: currentAction.actionId,
    }

    if (currentAction.template != null) {
      showNudgeFromPrefetchedTemplate(
        currentAction.template,
        stateMachine.context,
        eventObj,
        cta,
        currentAction.type,
        currentAction?.config,
      )
    }
  }
}
