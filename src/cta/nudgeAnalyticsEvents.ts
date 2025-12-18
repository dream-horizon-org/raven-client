export interface NudgeCtaProcessingStartInterface {
  appEventName: string | null
  ctaValidTill: number | null
  ctaid: string | null
  nudgeShownCount: number | null
}

export interface NudgeCtaInValidInterface {
  appEventName: string | null
  ctaValidTill: number | null
  ctaid: string | null
  nudgeShownCount: number | null
  reason: string | null
}

export interface NudgeCtaEventProcessingFailedInterface {
  appEventName: string | null
  ctaValidTill: number | null
  ctaid: string | null
  errorMessage: string | null
  nudgeShownCount: number | null
}

export interface NudgeCtaStateTransitionInterface {
  appEventName: string | null
  ctaId: string | null
  currentState: number | null
  nudgeShownCount: number | null
  prevState: number | null
  stateMachineId: string | null
}

export interface NudgeCtaStateMachineResetInterface {
  appEventName: string | null
  ctaId: string | null
  stateMachineId: string | null
  currentState: number | null
  prevState: number | null
}

export interface NudgeCtaStateTransitionActionInterface {
  actionType: string | null
  appEventName: string | null
  ctaId: string | null
  currentState: number | null
  nudgeShown: boolean | null
  prevState: number | null
  stateMachineId: string | null
}

export interface NudgeCtaTemplateFetchInterface {
  appEventName: string | null
  ctaId: string | null
  currentState: number | null
  prevState: number | null
  responseFetched: boolean | null
  stateMachineId: string | null
  templateId: string | null
}

export interface NudgeCtaShownInterface {
  appEventName: string | null
  ctaId: string | null
  currentState: number | null
  prevState: number | null
  stateMachineId: string | null
  templateId: string | null
}

export interface NudgeBottomSheetShownInterface {
  actionType: string
  clickTestId: string
  ctaId: string
  currentState: number
  prevState: number
  stateMachineId: string
  templateId: string
}

export interface NudgePopupShownInterface {
  actionType: string | null
  clickTestId: string | null
  ctaId: string | null
  currentState: number | null
  prevState: number | null
  stateMachineId: string | null
  templateId: string | null
}

export interface NudgeCtaDismissEventInterface {
  actionType: string
  clickTestId: string
  ctaId: string
  currentState: number
  prevState: number
  stateMachineId: string
  templateId: string
}

export interface NudgeCtaClickEventInterface {
  actionType: string
  clickTestId: string
  ctaId: string
  currentState: number
  prevState: number
  stateMachineId: string
  templateId: string
}

export interface NudgeCtaClickFailedEventInterface {
  actionType: string
  clickTestId: string
  errorMessage: string
  ctaId: string
  currentState: number
  prevState: number
  stateMachineId: string
  templateId: string
}

export interface NudgeCtaEventActionInterface {
  appEventName: string
  ctaId: string
  currentState: number
  emitEventName: string
  emitEventParams: string | null
  prevState: number
  stateMachineId: string
}

export interface NudgeCtaClickDeeplinkFailedEventInterface {
  clickTestId: string
  ctaId: string
  templateId: string
  url: string
}
