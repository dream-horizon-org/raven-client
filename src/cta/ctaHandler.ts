import {nativeEventEmitter} from '../render-nudge/common/action/DeeplinkAction'
import {NudgeStorageKey} from '../storage/NudgeStorageKey'
import {
  DEFAULT_NUMBER_VALUE,
  DEFAULT_STRING_VALUE,
} from '../render-nudge/common/constants'

import {BehaviourTag} from './BehaviourTag'

import {StateMachine} from './StateMachine'
import {ANALYTICS_EVENT_GLOBAL_PROPS, CTA_FAILURE_REASON} from './cta.constants'
import type {
  CTAEvent,
  DeltaSnapShot,
  NudgeModel,
  Transition,
} from './cta.interface'
import {nudgeOptimizedSendEvent, sendRavenAppEvent} from './ctaEvent'
import {processFilters} from './ctaFilters'
import {
  createCTAObjectsForNonAccessCTAs,
  createEventToCTAMapping,
  getCTAObjectsAndResetOnFirstLaunch,
  getRequestMapFromLocal,
  removeRequestMapFromLocal,
  setCtaDataToLocalStorage,
  updateBehaviourTagInRequestMap,
  updateCtaInRequestMap,
  updateCtasToLocalStorage,
} from './ctaUtils'
import {makeCtaApiPostRequest} from './makeCtaApi'
import {addRequestToQueue} from './requestQueue'
import {NudgeStorage} from '../storage/Storage'
import {NudgeAnalyticsEvents} from './eventsFile'
import {CTA} from './Cta'
import {ravenClient} from './ravenclient'

export let eventToCTAMap: Record<string, CTA[]> | null = null
export let activeCtas: Array<CTA> | null = null
export let accessedCtasId: Array<string> = []

export let eventGlobalProps: Record<string, string | boolean | number> = {}
let isGlobalPropsInit = false
nativeEventEmitter.addListener(ANALYTICS_EVENT_GLOBAL_PROPS, (_: unknown) => {
  isGlobalPropsInit = false
})

export const fetchCTA = async (): Promise<void> => {
  const isFirstAppLaunch = NudgeStorage.getBoolean(
    NudgeStorageKey.IS_FIRST_APP_LAUNCH,
    true,
  )
  let requestMapFromLocal = getRequestMapFromLocal()
  const nudgeModel: {data: NudgeModel} = await makeCtaApiPostRequest<
    DeltaSnapShot,
    {data: NudgeModel}
  >('cta/active/state-machines/', requestMapFromLocal ?? {ctas: []})
  if (nudgeModel && nudgeModel.data && nudgeModel.data.ctas?.length) {
    removeRequestMapFromLocal()
    const resData = nudgeModel.data
    if (eventToCTAMap === null || activeCtas === null) {
      activeCtas = getCTAObjectsAndResetOnFirstLaunch(
        isFirstAppLaunch,
        resData.ctas,
        resData.behaviourTags,
      )
      eventToCTAMap = createEventToCTAMapping(activeCtas)
    } else {
      activeCtas = createCTAObjectsForNonAccessCTAs(
        activeCtas,
        resData.ctas,
        accessedCtasId,
        resData.behaviourTags,
      )
      eventToCTAMap = createEventToCTAMapping(activeCtas)
    }
    setCtaDataToLocalStorage(activeCtas)
  } else if (
    nudgeModel &&
    nudgeModel.data &&
    nudgeModel.data.ctas?.length === 0
  ) {
    activeCtas = null
    eventToCTAMap = null
    setCtaDataToLocalStorage([])
  }
  if (isFirstAppLaunch) {
    NudgeStorage.setBoolean(NudgeStorageKey.IS_FIRST_APP_LAUNCH, false)
  }
}

export const getRelevantCtaForEvent = (appEvent: CTAEvent) => {
  if (eventToCTAMap === null) return
  return eventToCTAMap[appEvent.eventName]
}
const fetchAndStoreAnalyticsEventGlobalProps = () => {
  eventGlobalProps = Object.entries({}).reduce<
    Record<string, string | number | boolean>
  >(
    (globalProps, [key, value]) => {
      if (
        typeof value === 'string' ||
        typeof value === 'boolean' ||
        typeof value === 'number'
      ) {
        globalProps[key] = value
      }
      return globalProps
    },
    {} as Record<string, string | number | boolean>,
  )
  eventGlobalProps = {
    ...eventGlobalProps,
    app_name: ravenClient.getPackageNameValue(),
  }
  isGlobalPropsInit = true
}

export const trackAppEvent = (ctaEvent: CTAEvent) => {
  try {
    if (!isGlobalPropsInit) {
      fetchAndStoreAnalyticsEventGlobalProps()
    }
    const globalProps = {
      platform: (ravenClient.platform as string) ?? '',
      app_version: ravenClient.config?.appVersion ?? '',
    }

    const appEvent: CTAEvent = {
      ...ctaEvent,
      ...(eventGlobalProps as Record<string, boolean | string | number>),
      ...globalProps,
    }
    const requestMap: DeltaSnapShot = {ctas: []}
    const transitedCtas: CTA[] = []
    const relevantCTAs = getRelevantCtaForEvent(appEvent)
    if (!relevantCTAs) {
      return
    }
    let hasTransitionEverHappened = false
    for (const cta of relevantCTAs) {
      try {
        nudgeOptimizedSendEvent.addEvent(
          NudgeAnalyticsEvents.NudgeCtaProcessingStart,
          {
            appEventName: appEvent.eventName,
            ctaid: cta.id,
            stateMachineID: null,
            nudgeShownCount:
              (cta.ctaResetAt?.length || 0) +
              (cta.ctaResetInSessionAt?.length || 0),
            ctaValidTill: cta.ctaValidTill,
          },
        )
        if (!cta.isCTAValid(appEvent)) {
          continue
        }
        const {currentStateMachine, stateMachineId} =
          cta.getStateMachine(appEvent)
        if (!currentStateMachine) {
          continue
        }
        if (currentStateMachine.hasExpired(cta.stateMachineTTL)) {
          nudgeOptimizedSendEvent.addEvent(
            NudgeAnalyticsEvents.NudgeCtaInValid,
            {
              appEventName: appEvent.eventName,
              ctaid: cta.id,
              nudgeShownCount:
                (cta.ctaResetInSessionAt?.length || 0) +
                (cta.ctaResetAt?.length || 0),
              ctaValidTill: cta.ctaValidTill,
              reason: CTA_FAILURE_REASON.STATE_MACHINE_EXPIRED,
            },
          )
          delete cta.activeStateMachines[stateMachineId]
          continue
        }
        const currentState = parseInt(currentStateMachine.currentState, 10)
        const transitions =
          cta.stateTransition[appEvent.eventName][currentState] || []

        const hasTransitionHappened = processTransition(
          transitions,
          stateMachineId,
          currentStateMachine,
          appEvent,
          cta,
          requestMap,
          transitedCtas,
        )
        hasTransitionEverHappened =
          hasTransitionEverHappened || hasTransitionHappened
      } catch (e) {
        nudgeOptimizedSendEvent.addEvent(
          NudgeAnalyticsEvents.NudgeCtaEventProcessingFailed,
          {
            appEventName: appEvent.eventName,
            ctaid: cta.id,
            stateMachineID: null,
            nudgeShownCount:
              (cta.ctaResetAt?.length || 0) +
              (cta.ctaResetInSessionAt?.length || 0),
            ctaValidTill: cta.ctaValidTill,
            errorMessage:
              e && e instanceof Error && e.message
                ? e.message
                : 'Cta Processing failed',
          },
        )
      }
    }

    if (hasTransitionEverHappened && requestMap.ctas.length) {
      updateCtasToLocalStorage(transitedCtas)
      addRequestToQueue(requestMap)
    }
    nudgeOptimizedSendEvent.sendEvents()
  } catch (e) {
    sendRavenAppEvent(NudgeAnalyticsEvents.NudgeCtaTemplateFetch, {
      appEventName: ctaEvent.eventName,
      ctaid: null,
      stateMachineID: null,
      nudgeShownCount: null,
      ctaValidTill: null,
      errorMessage:
        e && e instanceof Error && e.message
          ? e.message
          : 'Cta Processing function failed',
    })
  }
}

export function processTransition(
  transitions: Transition[],
  stateMachineId: string,
  currStateMachine: StateMachine,
  appEvent: CTAEvent,
  cta: CTA,
  requestMap: DeltaSnapShot,
  transitedCtas: CTA[],
): boolean {
  try {
    let hasTransitionHappened = false
    for (const transition of transitions) {
      const areFiltersSatisfied = processFilters(transition?.filters, appEvent)
      if (areFiltersSatisfied) {
        const nextState = transition.transitionTo
        if (appEvent.actionDone && cta.stateToAction[nextState]) {
          continue
        }
        hasTransitionHappened = true

        currStateMachine.setCurrentState(nextState)
        currStateMachine.setContextParams(appEvent, cta.contextParams)

        nudgeOptimizedSendEvent.addEvent(
          NudgeAnalyticsEvents.NudgeCtaStateTransition,
          {
            appEventName: appEvent.eventName,
            ctaId: cta.id,
            stateMachineId: stateMachineId,
            currentState: nextState,
            nudgeShownCount:
              (cta.ctaResetAt?.length || 0) +
              (cta.ctaResetInSessionAt?.length || 0),
            prevState: currStateMachine.currentState,
          },
        )
        cta.handleCTAActions(
          currStateMachine,
          stateMachineId,
          currStateMachine.currentState,
          appEvent,
        )

        const isResetAction = cta.resetStates.includes(nextState)
        if (isResetAction) {
          cta.deleteStateMachineAndIncreaseFrequency(stateMachineId)
          nudgeOptimizedSendEvent.addEvent(
            NudgeAnalyticsEvents.NudgeCtaStateMachineReset,
            {
              appEventName: appEvent.eventName,
              ctaId: cta.id,
              stateMachineId: stateMachineId,
              currentState: Number(nextState),
              nudgeShownCount:
                (cta.ctaResetAt?.length || 0) +
                (cta.ctaResetInSessionAt?.length || 0),
              prevState: currStateMachine.currentState,
            },
          )
        }
        prepareRequestMap(
          requestMap,
          cta,
          stateMachineId,
          currStateMachine,
          isResetAction,
        )
        transitedCtas.push(cta)
        accessedCtasId?.push(cta.id)
        break
      }
    }
    return hasTransitionHappened
  } catch {
    return false
  }
}

function prepareRequestMap(
  requestMap: DeltaSnapShot,
  cta: CTA,
  stateMachineId: string,
  currentStateMachine: StateMachine,
  isResetAction: boolean,
) {
  updateCtaInRequestMap(
    requestMap,
    cta,
    stateMachineId,
    currentStateMachine,
    isResetAction,
  )
  updateBehaviourTagInRequestMap(requestMap, cta)
}

export const getCtaFromStorageToMemory = () => {
  try {
    const data = NudgeStorage.getString(NudgeStorageKey.CTA_DATA, '')
    if (typeof data === 'string' && data !== '') {
      let ctaData: CTA[] = JSON.parse(data) as CTA[]
      const behaviourTagsCache = new Map<string, BehaviourTag>()
      if (ctaData.length > 0) {
        ctaData = ctaData.map((cta) => {
          let newCta: CTA
          if (cta.behaviourTagName && cta.behaviourTag) {
            if (behaviourTagsCache.has(cta.behaviourTagName)) {
              newCta = new CTA(
                cta,
                behaviourTagsCache.get(cta.behaviourTagName) as BehaviourTag,
              )
            } else {
              const behaviourTag = new BehaviourTag(cta.behaviourTag)
              newCta = new CTA(cta, behaviourTag)
              behaviourTagsCache.set(cta.behaviourTagName, behaviourTag)
            }
          } else {
            newCta = new CTA(cta)
          }
          return newCta
        })
      }
      activeCtas = ctaData
      eventToCTAMap = createEventToCTAMapping(ctaData)
    }
  } catch (error) {
    console.log(error)
  }
}

export const resetCtaHandlerGlobalState = () => {
  eventToCTAMap = null
  activeCtas = null
  eventGlobalProps.state = DEFAULT_STRING_VALUE
  eventGlobalProps.teamName = DEFAULT_STRING_VALUE
  eventGlobalProps.userId = DEFAULT_NUMBER_VALUE
  eventGlobalProps.utmFullString = DEFAULT_STRING_VALUE
}
