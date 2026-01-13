import {NudgeAnalyticsEvents} from '../../../../cta/eventsFile'
import {ravenClient} from '../../../../cta/ravenclient'

import type {TouchableViewType} from '../../../screens/NudgeScreen/ViewTypes.interface'
import {resolveProp} from '../../../screens/NudgeScreen/utils/StringUtils'
import {DEFAULT_NUMBER_VALUE, DEFAULT_STRING_VALUE} from '../../constants'
import {ActionTypeInterface} from '../ActionType.interface'
import type {ActionProps, NudgeNavigation} from '../ActionType.interface'
import {
  resolveDynamicEventProperties,
  triggerAnalyticsEventAction,
} from '../AnalytictsEventAction'
import {triggerDeeplinkAction} from '../DeeplinkAction'
import {triggerDismissAction} from '../DismissAction'
import {triggerNativeEventViaEmitterAction} from '../NativeEventEmitterAction'

export function performAction(
  viewTestId: string,
  action: ActionProps,
  nudgeNav: NudgeNavigation,
  context: Record<string, unknown>,
) {
  try {
    switch (action.type) {
      case ActionTypeInterface.DISMISS: {
        triggerDismissAction(nudgeNav)
        break
      }
      case ActionTypeInterface.DEEPLINK: {
        triggerDeeplinkAction(action, context, viewTestId)
        break
      }
      case ActionTypeInterface.ANALYTICS_EVENT: {
        triggerAnalyticsEventAction(action, context)
        break
      }
      case ActionTypeInterface.EMIT_NATIVE_EVENT: {
        triggerNativeEventViaEmitterAction(
          action.params.eventName,
          resolveDynamicEventProperties(
            action.params.eventParams ?? [],
            context,
          ),
        )
        break
      }
      default: {
        sendCTAClickPerformActionEvent(viewTestId, context)
        break
      }
    }
  } catch (e) {
    sendCTAPerformActionFailedEvent(action, viewTestId, e, context)
  }
}

export const performActions = (
  nudgeNav: NudgeNavigation,
  data: TouchableViewType,
  context: Record<string, unknown>,
) => {
  try {
    const actions = data.actions
    const viewTestId =
      resolveProp<string>(data.props.testId, context, 'string') ??
      DEFAULT_STRING_VALUE
    if (actions) {
      actions.forEach((action) => {
        performAction(viewTestId, action, nudgeNav, context)
      })
      sendNudgeCTAClickEvent(viewTestId, actions, context)
    }
  } catch (exception) {
    sendNudgeCTAClickFailedEvent(data, exception, context)
  }
}

function sendNudgeCTAClickEvent(
  viewTestId: string,
  actions?: ActionProps[],
  context?: Record<string, unknown>,
) {
  ravenClient.onAppEvent(NudgeAnalyticsEvents.NudgeCtaClickEvent, {
    actionType:
      actions?.map((actionProps) => actionProps.type).join(',') ??
      DEFAULT_STRING_VALUE,
    clickTestId: viewTestId,
    ctaId: (context?.ctaId as string) ?? DEFAULT_STRING_VALUE,
    currentState: (context?.currentState as number) ?? DEFAULT_NUMBER_VALUE,
    prevState: (context?.prevState as number) ?? DEFAULT_NUMBER_VALUE,
    stateMachineId: (context?.stateMachineId as string) ?? DEFAULT_STRING_VALUE,
    templateId: (context?.templateId as string) ?? DEFAULT_STRING_VALUE,
  })
}

function sendCTAClickPerformActionEvent(
  viewTestId: string,
  context?: Record<string, unknown>,
) {
  ravenClient.onAppEvent(NudgeAnalyticsEvents.NudgeCtaClickFailedEvent, {
    actionType: ActionTypeInterface.NONE,
    clickTestId: viewTestId,
    errorMessage: 'Nudge Click Action Type is None',
    ctaId: (context?.ctaId as string) ?? DEFAULT_STRING_VALUE,
    currentState: (context?.currentState as number) ?? DEFAULT_NUMBER_VALUE,
    prevState: (context?.prevState as number) ?? DEFAULT_NUMBER_VALUE,
    stateMachineId: (context?.stateMachineId as string) ?? DEFAULT_STRING_VALUE,
    templateId: (context?.templateId as string) ?? DEFAULT_STRING_VALUE,
  })
}

function sendNudgeCTAClickFailedEvent(
  data: TouchableViewType,
  error: unknown,
  context?: Record<string, unknown>,
) {
  const viewTestId =
    resolveProp<string>(data.props.testId, context ?? {}, 'string') ??
    DEFAULT_STRING_VALUE
  ravenClient.onAppEvent(NudgeAnalyticsEvents.NudgeCtaClickFailedEvent, {
    actionType: ActionTypeInterface.NONE,
    clickTestId: viewTestId,
    errorMessage:
      error instanceof Error && error.message
        ? error.message
        : 'Cta Processing failed',
    ctaId: (context?.ctaId as string) ?? DEFAULT_STRING_VALUE,
    currentState: (context?.currentState as number) ?? DEFAULT_NUMBER_VALUE,
    prevState: (context?.prevState as number) ?? DEFAULT_NUMBER_VALUE,
    stateMachineId: (context?.stateMachineId as string) ?? DEFAULT_STRING_VALUE,
    templateId: (context?.templateId as string) ?? DEFAULT_STRING_VALUE,
  })
}

function sendCTAPerformActionFailedEvent(
  action: ActionProps,
  viewTestId: string,
  error: unknown,
  context?: Record<string, unknown>,
) {
  ravenClient.onAppEvent(NudgeAnalyticsEvents.NudgeCtaClickFailedEvent, {
    actionType: action.type,
    clickTestId: viewTestId,
    errorMessage:
      error instanceof Error && error.message
        ? error.message
        : 'Cta Processing failed',
    ctaId: (context?.ctaId as string) ?? DEFAULT_STRING_VALUE,
    currentState: (context?.currentState as number) ?? DEFAULT_NUMBER_VALUE,
    prevState: (context?.prevState as number) ?? DEFAULT_NUMBER_VALUE,
    stateMachineId: (context?.stateMachineId as string) ?? DEFAULT_STRING_VALUE,
    templateId: (context?.templateId as string) ?? DEFAULT_STRING_VALUE,
  })
}
