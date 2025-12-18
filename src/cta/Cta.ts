import {BehaviourTag} from './BehaviourTag'
import {TooltipSystem} from '../Tooltip'

import {StateMachine} from './StateMachine'
import {performCTAEventAction} from './cta-actions/ctaEventAction'
import {performCTANudgeAction} from './cta-actions/ctaNudgeAction'
import {CTA_FAILURE_REASON} from './cta.constants'
import {ActionType} from './cta.interface'
import type {
  ActiveStateMachines,
  Cta,
  CTAEvent,
  StateMachineObject,
  CtaTooltipAction,
} from './cta.interface'
import {nudgeOptimizedSendEvent} from './ctaEvent'
import {getMillisecondsInUnit} from './ctaUtils'
import {NudgeAnalyticsEvents} from './eventsFile'

type CTARule = Cta['rule']
export class CTA {
  actions: CTARule['actions']

  id: Cta['ctaId']

  contextParams: CTARule['contextParams']

  priority: CTARule['priority']

  stateTransition: CTARule['stateTransition']

  activeStateMachines: Record<string, StateMachine>

  stateMachineTTL: CTARule['stateMachineTTL']

  ctaValidTill: CTARule['ctaValidTill']

  frequency: CTARule['frequency']

  groupByConfig?: CTARule['groupByConfig']

  stateToAction: CTARule['stateToAction']

  resetStates: CTARule['resetStates']

  ctaResetAt: Cta['resetAt']

  actionDoneAt: Cta['actionDoneAt']

  behaviourTagName?: Cta['behaviourTagName']

  resetCTAonFirstLaunch: CTARule['resetCTAonFirstLaunch']

  behaviourTag?: BehaviourTag

  ctaResetInSessionAt: Array<number>

  constructor(param: Cta | CTA, behaviourTag?: BehaviourTag) {
    if (!this.isCta(param)) {
      this.actions = param.actions
      this.frequency = param.frequency
      this.groupByConfig = param.groupByConfig
      this.stateToAction = param.stateToAction
      this.resetStates = param.resetStates
      this.ctaResetAt = param.ctaResetAt
      this.ctaResetInSessionAt = param.ctaResetInSessionAt || []
      this.stateMachineTTL = param.stateMachineTTL
      this.ctaValidTill = param.ctaValidTill
      this.id = param.id
      this.contextParams = param.contextParams || []
      this.stateTransition = param.stateTransition || []
      this.priority = param.priority
      this.actionDoneAt = param.actionDoneAt || []
      this.behaviourTag = behaviourTag || undefined
      this.behaviourTagName = param.behaviourTagName || undefined
      this.resetCTAonFirstLaunch = param.resetCTAonFirstLaunch
      this.activeStateMachines = this.getStateMachinesObject(
        param.activeStateMachines ?? {},
      )
    } else {
      const data = param.rule
      this.actions = data.actions
      this.frequency = data.frequency
      this.groupByConfig = data.groupByConfig || undefined
      this.stateToAction = data.stateToAction
      this.ctaResetInSessionAt = []
      this.stateMachineTTL = data.stateMachineTTL || null
      this.ctaValidTill = data.ctaValidTill || null
      this.id = param.ctaId
      this.contextParams = data.contextParams || []
      this.stateTransition = data.stateTransition || []
      this.resetStates = data.resetStates || []
      this.priority = data.priority
      this.ctaResetAt = param.resetAt || []
      this.actionDoneAt = param.actionDoneAt || []
      this.behaviourTagName = param.behaviourTagName || undefined
      this.behaviourTag = behaviourTag || undefined
      this.resetCTAonFirstLaunch = data.resetCTAonFirstLaunch || false
      this.activeStateMachines =
        this.getStateMachinesObjectsFromActiveStateMachine(
          param.activeStateMachines ?? {},
        )
    }
  }

  private isCta(param: any): param is Cta {
    return 'rule' in param
  }

  isCTAValid(eventParams: CTAEvent) {
    return (
      this.isBehaviourTagExposureFrequencyValid() &&
      this.isBehaviourTagCtaRelationValid() &&
      this.isCtaNotExpired(eventParams) &&
      this.hasFrequencyLimitReached(eventParams) &&
      this.hasValidGroupByKeys(eventParams)
    )
  }

  private hasValidGroupByKeys(eventParams: CTAEvent) {
    const {groupByConfig} = this
    if (groupByConfig?.groupByKeys && groupByConfig.groupByKeys.length > 0) {
      if (
        !groupByConfig.groupByKeys.every(
          (key) => eventParams[key] !== undefined,
        )
      ) {
        this.sendCtaInvalidEvent(
          eventParams,
          CTA_FAILURE_REASON.GROUP_BY_KEYS_NOT_FOUND,
        )
        return false
      }
    }
    return true
  }

  private isCtaNotExpired(appEvent: CTAEvent): boolean {
    if (!this.ctaValidTill) return true
    const currentTimestamp = Date.now()
    const ctaValidTillTimestamp = this.ctaValidTill
    const hasNotExpired = currentTimestamp <= ctaValidTillTimestamp
    if (!hasNotExpired) {
      this.sendCtaInvalidEvent(appEvent, CTA_FAILURE_REASON.CTA_TTL_EXPIRED)
    }
    return hasNotExpired
  }

  private sendCtaInvalidEvent(
    appEvent: CTAEvent,
    reason: (typeof CTA_FAILURE_REASON)[keyof typeof CTA_FAILURE_REASON],
  ) {
    nudgeOptimizedSendEvent.addEvent(NudgeAnalyticsEvents.NudgeCtaInValid, {
      appEventName: appEvent.eventName,
      ctaid: this.id,
      nudgeShownCount: this.ctaResetInSessionAt.length + this.ctaResetAt.length,
      ctaValidTill: this.ctaValidTill,
      reason: reason,
    })
  }

  private hasFrequencyLimitReached(appEvent: CTAEvent): boolean {
    const {ctaResetInSessionAt, ctaResetAt, frequency} = this
    const allNudgeTimestamps = [...ctaResetInSessionAt, ...ctaResetAt]
    if (frequency.lifespan && frequency.lifespan.limit) {
      if (allNudgeTimestamps.length >= frequency.lifespan.limit) {
        this.sendCtaInvalidEvent(
          appEvent,
          CTA_FAILURE_REASON.LIFESPAN_FREQUENCY_ENDED,
        )
        return false
      }
    }
    if (
      frequency.window &&
      frequency.window.limit &&
      frequency.window.unit &&
      frequency.window.value
    ) {
      const currentTimestamp = Date.now()
      const windowStartTimestamp =
        currentTimestamp -
        frequency.window.value * getMillisecondsInUnit(frequency.window.unit)

      const nudgeCountWithinWindow = allNudgeTimestamps.filter(
        (timestamp) => timestamp >= windowStartTimestamp,
      ).length
      if (nudgeCountWithinWindow >= frequency.window.limit) {
        this.sendCtaInvalidEvent(
          appEvent,
          CTA_FAILURE_REASON.WINDOW_FREQUENCY_ENDED,
        )
        return false
      }
    }

    if (frequency.session && frequency.session.limit) {
      if (ctaResetInSessionAt.length >= frequency.session.limit) {
        this.sendCtaInvalidEvent(
          appEvent,
          CTA_FAILURE_REASON.SESSION_FREQUENCY_ENDED,
        )
        return false
      }
    }

    return true
  }

  private isBehaviourTagCtaRelationValid() {
    if (
      this.behaviourTagName === undefined ||
      this.behaviourTag === undefined
    ) {
      return true
    }

    const result = this.behaviourTag.isCtasRelationValid(this.id)
    return result
  }

  private isBehaviourTagExposureFrequencyValid() {
    if (
      this.behaviourTagName === undefined ||
      this.behaviourTag === undefined
    ) {
      return true
    }
    return this.behaviourTag.isExposureFrequencyValid()
  }

  private markCtaActiveForBehaviourTag() {
    if (
      this.behaviourTagName === undefined ||
      this.behaviourTag === undefined
    ) {
      return
    }
    return this.behaviourTag.makeCtaActiveForBehaviourTag(this.id)
  }

  private getStateMachinesObjectsFromActiveStateMachine(
    data: ActiveStateMachines,
  ): Record<string, StateMachine> {
    const stateMachines: Record<string, StateMachine> = {}

    for (const [key, value] of Object.entries(data)) {
      stateMachines[key] = new StateMachine(value as StateMachineObject)
    }

    return stateMachines
  }

  private getStateMachinesObject(
    data: Record<string, StateMachine>,
  ): Record<string, StateMachine> {
    const stateMachines: Record<string, StateMachine> = {}

    for (const [key, value] of Object.entries(data)) {
      stateMachines[key] = new StateMachine(value)
    }

    return stateMachines
  }

  getStateMachineId(eventParams: CTAEvent): string {
    const {groupByConfig} = this

    if (groupByConfig?.groupByKeys && groupByConfig.groupByKeys.length > 0) {
      // Generate ID based on groupBy keys
      return groupByConfig.groupByKeys.map((key) => eventParams[key]).join('-')
    } else {
      // If groupBy keys are not present, use CTA ID as the key
      return this.id
    }
  }

  handleCTAActions(
    stateMachine: StateMachine,
    stateMachineId: string,
    prevState: string,
    appEvent: CTAEvent,
  ) {
    const currentState = stateMachine.currentState
    const currentActionId = this.stateToAction[currentState]

    if (!currentActionId) {
      return
    }
    const currentAction = this.actions.find(
      (action) => action.actionId === currentActionId,
    )
    if (!currentAction) {
      return
    }
    nudgeOptimizedSendEvent.addEvent(
      NudgeAnalyticsEvents.NudgeCtaStateTransitionAction,
      {
        appEventName: appEvent.eventName,
        ctaId: this.id,
        stateMachineId: stateMachineId,
        currentState: stateMachine.currentState,
        prevState,
        actionType: currentAction.type,
        nudgeShown: appEvent.actionDone,
      },
    )
    switch (currentAction.type) {
      case ActionType.ACTION: {
        performCTAEventAction(
          appEvent,
          currentAction,
          stateMachineId,
          stateMachine,
          prevState,
          this.id,
        )
        this.addActionDoneTimeStamp()
        this.markCtaActiveForBehaviourTag()
        break
      }

      case ActionType.NUDGE:
      case ActionType.NUDGE_POPUP: {
        performCTANudgeAction(
          stateMachine,
          appEvent,
          stateMachineId,
          prevState,
          currentAction,
          this,
        )
        this.addActionDoneTimeStamp()
        this.markCtaActiveForBehaviourTag()
        break
      }
      case ActionType.TOOLTIP: {
        const template = currentAction.template || ({} as any)

        const ctaTooltipAction: CtaTooltipAction = {
          actionId: currentAction.actionId,
          type: ActionType.TOOLTIP,
          template: {
            type: ActionType.TOOLTIP,
            props: {
              ...(template.props || {}),
              targetId:
                (template.props && template.props.targetId) ||
                'default_tooltip',
            },
            styles: template.styles || {},
            actions: template.actions || [],
          },
        }

        TooltipSystem.showFromCTA(ctaTooltipAction)
        this.addActionDoneTimeStamp()
        this.markCtaActiveForBehaviourTag()
        break
      }
    }
  }

  private addActionDoneTimeStamp() {
    this.actionDoneAt.push(Date.now())
  }

  private addCtaResetInSessionAt(resetTimeStamp: number) {
    this.ctaResetInSessionAt.push(resetTimeStamp)
  }

  private addBehaviourTagCtaResetInSessionAt(resetTimeStamp: number) {
    this.behaviourTag?.addCtaResetInSessionAt(this.id, resetTimeStamp)
  }

  deleteStateMachineAndIncreaseFrequency(stateMachineId: string) {
    const resetTimeStamp = Date.now()
    this.addBehaviourTagCtaResetInSessionAt(resetTimeStamp)
    this.addCtaResetInSessionAt(resetTimeStamp)
    delete this.activeStateMachines[stateMachineId]
  }

  getStateMachine(appEvent: CTAEvent) {
    const stateMachineId = this.getStateMachineId(appEvent)
    let currentStateMachine = this.activeStateMachines[stateMachineId]
    if (!currentStateMachine && this.canCreateMoreStateMachines()) {
      currentStateMachine = new StateMachine({} as StateMachineObject)
      this.activeStateMachines[stateMachineId] = currentStateMachine
    }
    return {stateMachineId, currentStateMachine}
  }

  private canCreateMoreStateMachines() {
    if (
      this.groupByConfig === undefined ||
      this.groupByConfig.maxActiveStateMachineCount === undefined
    ) {
      return true
    }
    return (
      Object.keys(this.activeStateMachines).length <
      this.groupByConfig.maxActiveStateMachineCount
    )
  }
}
