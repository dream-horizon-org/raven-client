import type {DynamicArray} from '../render-nudge/common/action/ActionType.interface'
import type {RenderViewType} from '../render-nudge/screens/NudgeScreen/ViewTypes.interface'

export type ComparisonType = '=' | '>' | '<' | '>=' | '<=' | '!='
export type FunctionsOperator = '+' | '-'
export type OperatorType = 'AND' | 'OR'

export type Filter = {
  propertyName: string
  propertyType: string
  comparisonType: ComparisonType
  comparisonValue: string | boolean | number
  functions?: FilterFunctions
}

type FunctionOperand =
  | number
  | string
  | {
      operator: FunctionsOperator
      operand1: FunctionOperand
      operand2: FunctionOperand
    }

export type FilterFunctions = {
  operator: FunctionsOperator
  operand1: FunctionOperand
  operand2: FunctionOperand
}
export type FilterGroup = {
  operator: OperatorType
  filter: (Filter | FilterGroup)[]
}

export type Filters = {
  operator: OperatorType
  filter: (Filter | FilterGroup)[]
}

export type Transition = {
  transitionTo: string
  filters?: Filters
}

export type DeltaCta = {
  ctaId: string
  activeStateMachines: {
    [stateMachineId: string]: StateMachineObject
  }
  resetAt: number[]
  actionDoneAt: number[]
}

export type DeltaBehaviourTag = {
  behaviourTagName: string
  exposureRule?: {
    ctasResetAt: CtaRecord[]
  }
  ctaRelation?: {
    activeCtas: string[]
  }
}

export type DeltaSnapShot = {
  ctas: DeltaCta[]
  behaviourTags?: DeltaBehaviourTag[]
}

export type StateTransition = Record<string, Record<string, Transition[]>>

export type Context = Record<string, unknown>

export type StateMachineObject = {
  currentState: string
  lastTransitionAt: number
  context: Context
  createdAt: number
  reset: boolean
}

export type ActiveStateMachines = Record<string, StateMachineObject>

export type CTAEvent = {
  eventName: string
  actionDone: boolean
  ActiveScreenName?: string
  routeName: string
  is_from_rn: boolean
  // extraParams?: Record<string, boolean | string | number>
} & {[key: string]: boolean | string | number}

export type CtaUIAction = {
  actionId: string
  type: ActionType.NUDGE
  config?: ActionConfig
  template: RenderViewType
}

export type CtaPopupAction = {
  actionId: string
  type: ActionType.NUDGE_POPUP
  config?: ActionConfig
  template: RenderViewType
}

export type CtaEventAction = {
  actionId: string
  type: ActionType.ACTION
  config?: ActionConfig
  template: {
    eventName: string
    eventParams?: DynamicArray[]
  }
}

export type CtaTooltipAction = {
  actionId: string
  type: ActionType.TOOLTIP
  template: {
    type: ActionType.TOOLTIP
    props: {
      title: string
      subTitle?: string
      position?: 'top' | 'bottom' | 'left' | 'right'
      titleColor?: string
      subTitleColor?: string
      titleFontSize?: number
      subTitleFontSize?: number
      titleFontFamily?: string
      subTitleFontFamily?: string
      titleFontWeight?: 'Bold' | 'Medium' | 'Regular'
      subTitleFontWeight?: 'Bold' | 'Medium' | 'Regular'
      targetId: string
      targetScreen?: string
      triggerType?: 'mount' | 'click' | 'event'
      triggerDelay?: number
      autoDismissMs?: number
      dismissOnOutsideTouch?: boolean
      titleAlignment?: 'left' | 'center' | 'right'
      subTitleAlignment?: 'left' | 'center' | 'right'
      arrowSize?: number
      testID?: string
    }
    styles?: {
      backgroundColor?: string
      borderRadius?: number
      paddingLeft?: number
      paddingRight?: number
      paddingTop?: number
      paddingBottom?: number
      marginTop?: number
      marginBottom?: number
      marginLeft?: number
      marginRight?: number
      arrowSize?: number
    }
    actions?: CtaActionType[]
  }
}

export type ActionConfig = {
  triggerDelay?: number
}

export enum ActionType {
  NUDGE = 'NUDGE_UI',
  ACTION = 'NUDGE_ACTION',
  NUDGE_POPUP = 'POPUP',
  TOOLTIP = 'TOOLTIP',
}

export type CtaActionType =
  | CtaUIAction
  | CtaEventAction
  | CtaPopupAction
  | CtaTooltipAction

export type CtaRecord = {
  resetAt: number
  ctaId: string
}

export type NudgeModel = {
  ctas: Cta[]
  behaviourTags?: BehaviourTagInfo[]
}

export type Cta = {
  ctaId: string
  rule: {
    actions: CtaActionType[]
    contextParams: string[]
    priority: number
    frequency: {
      session: {
        limit: number
      }
      window: {
        limit: number
        unit: string
        value: number
      }
      lifespan: {
        limit: number
      }
    }
    groupByConfig?: {
      maxActiveStateMachineCount?: number
      groupByKeys?: string[]
    }
    stateToAction: Record<string, string>
    resetStates: string[]
    resetCTAonFirstLaunch: boolean
    stateTransition: StateTransition
    stateMachineTTL: number | null
    ctaValidTill: number | null
  }
  resetAt: number[]
  actionDoneAt: number[]
  activeStateMachines: ActiveStateMachines
  behaviourTagName?: string
}

export type BehaviourTagInfo = {
  behaviourTagName: string
  exposureRule?: ExposureRule
  ctaRelation?: CtaRelation
}

export type ExposureRule = {
  session: {
    limit: number
  }
  window: {
    limit: number
    unit: string
    value: number
  }
  lifespan: {
    limit: number
  }
  ctasResetAt: CtaRecord[]
}

export type CtaRelation = {
  shownCta: {
    rule: string
    ctaList?: string[]
  }
  hideCta: {
    rule: string
    ctaList?: string[]
  }
  activeCtas: string[]
}
