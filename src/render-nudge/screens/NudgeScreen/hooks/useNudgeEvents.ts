import {NudgeAnalyticsEvents} from '../../../../cta/eventsFile'
import {ravenClient} from '../../../../cta/ravenclient'
import {NudgeCtaShownInterface} from '../../../../cta/nudgeAnalyticsEvents'

export const useNudgeEvents = (data: NudgeCtaShownInterface) => {
  const emitNudgeCtaShownEvent = () => {
    ravenClient.onAppEvent(NudgeAnalyticsEvents.NudgeCtaShown, {
      appEventName: data.appEventName,
      ctaId: data.ctaId,
      stateMachineId: data.stateMachineId,
      currentState: data.currentState,
      prevState: data.prevState,
      templateId: data.templateId,
    })
  }

  return {
    emitNudgeCtaShownEvent,
  }
}
