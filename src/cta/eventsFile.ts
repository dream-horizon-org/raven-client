import type {
  NudgeCtaProcessingStartInterface,
  NudgeCtaInValidInterface,
  NudgeCtaEventProcessingFailedInterface,
  NudgeCtaStateTransitionInterface,
  NudgeCtaStateMachineResetInterface,
  NudgeCtaStateTransitionActionInterface,
  NudgeCtaTemplateFetchInterface,
  NudgeCtaShownInterface,
  NudgeBottomSheetShownInterface,
  NudgePopupShownInterface,
  NudgeCtaDismissEventInterface,
  NudgeCtaClickEventInterface,
  NudgeCtaClickFailedEventInterface,
  NudgeCtaClickDeeplinkFailedEventInterface,
  NudgeCtaEventActionInterface,
} from './nudgeAnalyticsEvents'

export enum NudgeAnalyticsEvents {
  NudgeCtaProcessingStart = 'NudgeCtaProcessingStart',
  NudgeCtaInValid = 'NudgeCtaInValid',
  NudgeCtaEventProcessingFailed = 'NudgeCtaEventProcessingFailed',
  NudgeCtaStateTransition = 'NudgeCtaStateTransition',
  NudgeCtaStateMachineReset = 'NudgeCtaStateMachineReset',
  NudgeCtaStateTransitionAction = 'NudgeCtaStateTransitionAction',
  NudgeCtaTemplateFetch = 'NudgeCtaTemplateFetch',
  NudgeCtaShown = 'NudgeCtaShown',
  NudgeBottomSheetShown = 'NudgeBottomSheetShown',
  NudgePopupShown = 'NudgePopupShown',
  NudgeCtaDismissEvent = 'NudgeCtaDismissEvent',
  NudgeCtaClickEvent = 'NudgeCtaClickEvent',
  NudgeCtaClickFailedEvent = 'NudgeCtaClickFailedEvent',
  NudgeCtaClickDeeplinkFailedEvent = 'NudgeCtaClickDeeplinkFailedEvent',
  NudgeCtaEventAction = 'NudgeCtaEventAction',
}

export type NudgeAnalyticsEventTypes = {
  NudgeCtaProcessingStart: NudgeCtaProcessingStartInterface
  NudgeCtaInValid: NudgeCtaInValidInterface
  NudgeCtaEventProcessingFailed: NudgeCtaEventProcessingFailedInterface
  NudgeCtaStateTransition: NudgeCtaStateTransitionInterface
  NudgeCtaStateMachineReset: NudgeCtaStateMachineResetInterface
  NudgeCtaStateTransitionAction: NudgeCtaStateTransitionActionInterface
  NudgeCtaTemplateFetch: NudgeCtaTemplateFetchInterface
  NudgeCtaShown: NudgeCtaShownInterface
  NudgeBottomSheetShown: NudgeBottomSheetShownInterface
  NudgePopupShown: NudgePopupShownInterface
  NudgeCtaDismissEvent: NudgeCtaDismissEventInterface
  NudgeCtaClickEvent: NudgeCtaClickEventInterface
  NudgeCtaClickFailedEvent: NudgeCtaClickFailedEventInterface
  NudgeCtaClickDeeplinkFailedEvent: NudgeCtaClickDeeplinkFailedEventInterface
  NudgeCtaEventAction: NudgeCtaEventActionInterface
}
