import {CTA} from './Cta'
import type {Cta, StateMachineObject} from './cta.interface'

export class StateMachine {
  currentState: StateMachineObject['currentState']

  lastTransitionAt: StateMachineObject['lastTransitionAt']

  context: StateMachineObject['context']

  createdAt: StateMachineObject['createdAt']

  constructor(data?: StateMachineObject | StateMachine) {
    this.currentState = data?.currentState || '0'
    this.lastTransitionAt = data?.lastTransitionAt || Date.now()
    this.context = data?.context || {}
    this.createdAt = data?.createdAt || Date.now()
  }

  setCurrentState(state: string) {
    this.currentState = state
  }

  setContextParams(
    eventData: Record<string, unknown>,
    contextParams: Cta['rule']['contextParams'],
  ) {
    for (const key of contextParams) {
      if (key in eventData) {
        this.context[key] = eventData[key]
      }
    }
  }

  hasValidateContextParams = (cta: CTA): boolean => {
    for (const key of cta.contextParams) {
      if (!(key in this.context)) {
        return false
      }
    }

    return true
  }

  hasExpired(ttl: number | null) {
    if (!ttl) return false
    return this.createdAt + ttl < Date.now()
  }
}
