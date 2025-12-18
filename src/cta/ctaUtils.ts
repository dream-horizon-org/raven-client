import {NudgeStorage} from '../storage/Storage'
import {fetchCTA as fetchCTAInternal} from './ctaHandler'
import {NudgeStorageKey} from '../storage/NudgeStorageKey'
import type {RenderViewType} from '../render-nudge/screens/NudgeScreen/ViewTypes.interface'

import {BehaviourTag} from './BehaviourTag'
import {CTA} from './Cta'
import {StateMachine} from './StateMachine'
import {remove} from './behaviourTagUtils'
import {ActionType} from './cta.interface'
import type {
  ActionConfig,
  BehaviourTagInfo,
  Cta,
  DeltaBehaviourTag,
  DeltaCta,
  DeltaSnapShot,
  StateMachineObject,
} from './cta.interface'
import {sendNudgeAppEvent} from './ctaEvent'
import {addRequestToQueue} from './requestQueue'
import {navigate} from '../utils/NavigationContainerRef'
import {nudgeClient} from './nudgeclient'
import {NudgeAnalyticsEvents} from './eventsFile'
export const NUDGE_ROUTE_NAME = 'Nudge'

export function fetchCTA() {
  setTimeout(fetchCTAInternal, 1000)
}
export const shouldNotSendDelta = (
  requestQueue: DeltaSnapShot,
  requestInFlight: boolean,
) => {
  const isRequestQueueEmpty = !requestQueue.ctas.length
  return isRequestQueueEmpty || requestInFlight
}
export function getMillisecondsInUnit(unit: string): number {
  switch (unit) {
    case 'seconds':
      return 1000
    case 'minutes':
      return 60 * 1000
    case 'hours':
      return 60 * 60 * 1000
    case 'days':
      return 24 * 60 * 60 * 1000
    default:
      throw new Error(`Unsupported time unit: ${unit}`)
  }
}

export function getRequestMapFromLocal(): DeltaSnapShot | null {
  //get from local store
  //if value is not present return null
  const snapshot = NudgeStorage.getString(NudgeStorageKey.CTA_SNAPSHOT, '')
  if (!snapshot) return null
  try {
    return JSON.parse(snapshot)
  } catch {
    return null
  }
}

export function getBatchedRequestMapFromLocal(): DeltaSnapShot | null {
  //get from local store
  //if value is not present return null
  const snapshot = NudgeStorage.getString(
    NudgeStorageKey.BATCH_CTA_SNAPSHOT,
    '',
  )
  if (!snapshot) return null
  try {
    return JSON.parse(snapshot)
  } catch {
    return null
  }
}

export function getInTransitRequestMapFromLocal(): DeltaSnapShot | null {
  //get from local store
  //if value is not present return null
  const snapshot = NudgeStorage.getString(
    NudgeStorageKey.INTRANSIT_CTA_SNAPSHOT,
    '',
  )
  if (!snapshot) return null
  try {
    return JSON.parse(snapshot)
  } catch {
    return null
  }
}

export function removeRequestMapFromLocal(): void {
  NudgeStorage.setString(NudgeStorageKey.CTA_SNAPSHOT, '')
}

export function removeInTransitRequestMapFromLocal(): void {
  //remove snapshot from local by setting value to ''
  NudgeStorage.setString(NudgeStorageKey.INTRANSIT_CTA_SNAPSHOT, '')
}

export function removeBatchRequestMapFromLocal(): void {
  //remove snapshot from local by setting value to ''
  NudgeStorage.setString(NudgeStorageKey.BATCH_CTA_SNAPSHOT, '')
}

export function addRequestToLocal(snapshot: DeltaSnapShot): void {
  NudgeStorage.setString(NudgeStorageKey.CTA_SNAPSHOT, JSON.stringify(snapshot))
}

export function addBatchRequestTolocal(snapshot: DeltaSnapShot): void {
  NudgeStorage.setString(
    NudgeStorageKey.BATCH_CTA_SNAPSHOT,
    JSON.stringify(snapshot),
  )
}

export function addInTransitRequestTolocal(snapshot: DeltaSnapShot): void {
  NudgeStorage.setString(
    NudgeStorageKey.INTRANSIT_CTA_SNAPSHOT,
    JSON.stringify(snapshot),
  )
}

export function mergeRequestQueue(
  prevRequest: DeltaSnapShot,
  currentRequest: DeltaSnapShot,
): DeltaSnapShot {
  let result: DeltaSnapShot = {
    ...prevRequest,
    ctas: [...prevRequest.ctas],
  }

  for (const cta of currentRequest.ctas) {
    const ctaIndex = result.ctas.findIndex(
      (deltaCta) => deltaCta.ctaId === cta.ctaId,
    )

    if (ctaIndex === -1) {
      result.ctas.push(cta)
    } else {
      const existingCta = result.ctas[ctaIndex]

      const updatedActiveStateMachines = {...existingCta.activeStateMachines}
      for (const [stateMachineId, stateMachineObject] of Object.entries(
        cta.activeStateMachines,
      )) {
        updatedActiveStateMachines[stateMachineId] = {
          ...updatedActiveStateMachines[stateMachineId],
          ...stateMachineObject,
        }
      }

      result = {
        ...result,
        ctas: [
          ...result.ctas.slice(0, ctaIndex),
          {
            ...existingCta,
            activeStateMachines: updatedActiveStateMachines,
            resetAt: [...cta.resetAt],
            actionDoneAt: [...cta.actionDoneAt],
          },
          ...result.ctas.slice(ctaIndex + 1),
        ],
      }
    }
  }

  if (prevRequest.behaviourTags || currentRequest.behaviourTags) {
    result.behaviourTags = prevRequest.behaviourTags ?? []

    if (currentRequest.behaviourTags) {
      for (const behaviourTag of currentRequest.behaviourTags) {
        const behaviourTagIndex: number = result.behaviourTags.findIndex(
          (deltaBehaviourTag) =>
            deltaBehaviourTag.behaviourTagName ===
            behaviourTag.behaviourTagName,
        )

        if (behaviourTagIndex === -1) {
          result.behaviourTags.push(behaviourTag)
        } else {
          const existingTag: DeltaBehaviourTag =
            result.behaviourTags[behaviourTagIndex]

          const updatedExposureRule = behaviourTag.exposureRule
            ? {
                ctasResetAt: behaviourTag.exposureRule.ctasResetAt ?? [],
              }
            : existingTag.exposureRule

          const updatedCtaRelation = behaviourTag.ctaRelation
            ? {
                activeCtas: Array.from(
                  new Set(behaviourTag.ctaRelation.activeCtas ?? []),
                ),
              }
            : existingTag.ctaRelation

          result.behaviourTags = [
            ...result.behaviourTags.slice(0, behaviourTagIndex), // Before
            {
              ...existingTag,
              exposureRule: updatedExposureRule,
              ctaRelation: updatedCtaRelation,
            },
            ...result.behaviourTags.slice(behaviourTagIndex + 1), // After
          ]
        }
      }
    }
  }

  return result
}

export const timerMap: Map<string, NodeJS.Timeout> = new Map()

export function emitNudgeWithDelay(
  nudgeTemplate: RenderViewType,
  context: Record<string, unknown>,
  eventObj: Record<string, unknown>,
  cta: CTA,
  actionType: ActionType,
  nudgeConfig?: ActionConfig,
) {
  const triggerDelayInMillis = nudgeConfig?.triggerDelay ?? 0
  if (triggerDelayInMillis > 0) {
    if (timerMap.has(cta.id)) {
      clearTimeout(timerMap.get(cta.id))
      timerMap.delete(cta.id)
    }

    const newTimer = setTimeout(
      emitNudgeRoute,
      triggerDelayInMillis,
      nudgeTemplate,
      context,
      eventObj,
      actionType,
    )
    timerMap.set(cta.id, newTimer)
  } else {
    emitNudgeRoute(nudgeTemplate, context, eventObj, actionType)
  }
}

export const showNudgeFromPrefetchedTemplate = (
  nudgeTemplate: RenderViewType,
  context: Record<string, unknown>,
  eventObj: Record<string, unknown>,
  cta: CTA,
  actionType: ActionType,
  nudgeConfig?: ActionConfig,
) => {
  emitNudgeWithDelay(
    nudgeTemplate,
    context,
    eventObj,
    cta,
    actionType,
    nudgeConfig,
  )
  sendNudgeAppEvent(NudgeAnalyticsEvents.NudgeCtaTemplateFetch, {
    props: JSON.stringify(eventObj),
    responseFetched: true,
  })
}

export const emitNudgeRoute = (
  nudgeTemplateData: RenderViewType,
  context: Record<string, unknown>,
  eventObj: Record<string, unknown>,
  actionType: ActionType,
) => {
  navigate(nudgeClient.getNudgeRouteName(), {
    data: JSON.stringify(nudgeTemplateData),
    context: JSON.stringify({
      ...context,
      ...eventObj,
    }),
    isNative: false,
    actionType: actionType,
  })
}

export const getCTAObjectsAndResetOnFirstLaunch = (
  isFirstAppLaunch: boolean,
  ctaData: Cta[],
  behaviourTagInfos?: BehaviourTagInfo[],
): Array<CTA> => {
  const ctas: CTA[] = []
  const behaviourTagCache = new Map<string, BehaviourTag>()
  const requestMap: DeltaSnapShot = {ctas: []}

  ctaData?.forEach?.((cta, index) => {
    const behaviourTag = cta.behaviourTagName
      ? behaviourTagInfos?.find(
          (tag) => tag.behaviourTagName === cta.behaviourTagName,
        )
      : undefined

    if (behaviourTag) {
      if (!behaviourTagCache.has(behaviourTag.behaviourTagName)) {
        behaviourTagCache.set(
          behaviourTag.behaviourTagName,
          new BehaviourTag(behaviourTag),
        )
      }
      ctas[index] = new CTA(
        cta,
        behaviourTagCache.get(behaviourTag.behaviourTagName),
      )
    } else {
      ctas[index] = new CTA(cta)
    }

    resetActiveStateMachineOnFirstAppLaunch(
      ctas[index],
      requestMap,
      isFirstAppLaunch,
    )
  })

  if (requestMap.ctas.length > 0) {
    addRequestToQueue(requestMap)
  }
  return ctas
}

function resetActiveStateMachineOnFirstAppLaunch(
  currCTA: CTA,
  requestMap: DeltaSnapShot,
  isFirstAppLaunch: boolean,
) {
  if (!currCTA) {
    return
  }

  if (!currCTA.resetCTAonFirstLaunch) return
  if (!isFirstAppLaunch) return

  const resetActiveStateMachineObject: Record<string, StateMachineObject> = {}
  Object.entries(currCTA.activeStateMachines)?.forEach?.(
    ([stateMachineId, stateMachine]) => {
      resetActiveStateMachineObject[stateMachineId] = {
        ...stateMachine,
        reset: true,
      }
    },
  )

  currCTA.ctaResetInSessionAt = []
  currCTA.ctaResetAt = []
  currCTA.actionDoneAt = []
  currCTA.activeStateMachines = {}
  const deltaCta: DeltaCta = {
    ctaId: currCTA.id,
    activeStateMachines: {...resetActiveStateMachineObject},
    resetAt: [],
    actionDoneAt: [],
  }
  requestMap.ctas.push(deltaCta)

  if (currCTA.behaviourTag) {
    currCTA.behaviourTag.ctasResetAt = [
      ...currCTA.behaviourTag.ctasResetAt.filter(
        (record) => record.ctaId !== currCTA.id,
      ),
      ...currCTA.behaviourTag.ctasResetInSessionAt.filter(
        (record) => record.ctaId !== currCTA.id,
      ),
    ]
    remove(currCTA.behaviourTag.activeCtas, currCTA.id)
    updateBehaviourTagInRequestMap(requestMap, currCTA)
  }
}

export const createCTAObjectsForNonAccessCTAs = (
  oldCtaData: CTA[],
  latestCtaData: Cta[],
  accessedCtas: string[],
  latestBehaviourTagData?: BehaviourTagInfo[],
): CTA[] => {
  // Convert accessedCtas array into a Set for quick lookup
  const accessedCtasSet = new Set(accessedCtas) //accessedCtas = empty
  const behaviourTagCache = new Map<string, BehaviourTag>()
  oldCtaData?.forEach?.(({behaviourTag}) => {
    if (behaviourTag && !behaviourTagCache.has(behaviourTag.behaviourTagName)) {
      behaviourTagCache.set(behaviourTag.behaviourTagName, behaviourTag)
    }
  })

  // Create a map from old CTA data for quick lookup
  const oldCtaMap = new Map(oldCtaData.map((cta) => [cta.id, cta])) // oldCtaData = null

  // Initialize the list of updated CTAs
  const updatedCtas: CTA[] = []

  // Process the latest CTAs
  for (const latestCta of latestCtaData) {
    if (
      accessedCtasSet.has(latestCta.ctaId) &&
      oldCtaMap.has(latestCta.ctaId)
    ) {
      updatedCtas.push(oldCtaMap.get(latestCta.ctaId)!) // If the CTA is accessed in the session, take the older version
    } else {
      let cta: CTA
      const behaviourTag = latestBehaviourTagData?.find(
        (tag) => tag.behaviourTagName === latestCta.behaviourTagName,
      )

      if (behaviourTag) {
        if (!behaviourTagCache.has(behaviourTag.behaviourTagName)) {
          behaviourTagCache.set(
            behaviourTag.behaviourTagName,
            new BehaviourTag(behaviourTag),
          )
        }
        cta = new CTA(
          latestCta,
          behaviourTagCache.get(behaviourTag.behaviourTagName),
        )
      } else {
        cta = new CTA(latestCta)
      }
      updatedCtas.push(cta)
    }
  }
  return updatedCtas
}

export const createEventToCTAMapping = (ctas: CTA[]): Record<string, CTA[]> => {
  const eventCTAMap: Record<string, CTA[]> = {}

  ctas?.forEach?.((cta) => {
    const stateTransition = cta.stateTransition

    for (const eventName in stateTransition) {
      if (eventName in stateTransition) {
        if (!eventCTAMap[eventName]) {
          eventCTAMap[eventName] = []
        }
        eventCTAMap[eventName].push(cta)
      }
    }
  })
  for (const eventName in eventCTAMap) {
    eventCTAMap[eventName].sort((ctaA, ctaB) => {
      return ctaA.priority - ctaB.priority
    })
  }

  return eventCTAMap
}

export function updateCtaInRequestMap(
  requestMap: DeltaSnapShot,
  cta: CTA,
  stateMachineId: string,
  currentStateMachine: StateMachine,
  isResetAction: boolean,
) {
  const ctaIndex = requestMap.ctas.findIndex(
    (deltaCta) => deltaCta.ctaId === cta.id,
  )

  const deltaCta = createDeltaCta(
    cta,
    stateMachineId,
    currentStateMachine,
    isResetAction,
  )

  if (ctaIndex === -1) {
    requestMap.ctas.push(deltaCta)
  } else {
    requestMap.ctas[ctaIndex] = deltaCta
  }
}

export function createDeltaCta(
  cta: CTA,
  stateMachineId: string,
  currentStateMachine: StateMachine,
  isResetAction: boolean,
): DeltaCta {
  return {
    ctaId: cta.id,
    activeStateMachines: {
      [stateMachineId]: {
        ...currentStateMachine,
        reset: isResetAction,
      },
    },
    resetAt: [...cta.ctaResetAt, ...cta.ctaResetInSessionAt],
    actionDoneAt: cta.actionDoneAt,
  }
}

export function updateBehaviourTagInRequestMap(
  requestMap: DeltaSnapShot,
  cta: CTA,
) {
  if (cta.behaviourTag === undefined) {
    return
  }
  if (!requestMap.behaviourTags) {
    requestMap.behaviourTags = []
  }

  const behaviourTagIndex = requestMap.behaviourTags.findIndex(
    (deltaBehaviourTag) =>
      deltaBehaviourTag.behaviourTagName === cta.behaviourTag?.behaviourTagName,
  )

  const deltaBehaviourTag = createDeltaBehaviourTag(cta.behaviourTag)

  if (behaviourTagIndex === -1) {
    requestMap.behaviourTags.push(deltaBehaviourTag)
  } else {
    requestMap.behaviourTags[behaviourTagIndex] = deltaBehaviourTag
  }
}

export function createDeltaBehaviourTag(
  behaviourTag: BehaviourTag,
): DeltaBehaviourTag {
  const deltaBehaviourTag: DeltaBehaviourTag = {
    behaviourTagName: behaviourTag.behaviourTagName,
  }

  if (behaviourTag.exposureRule) {
    deltaBehaviourTag.exposureRule = {
      ctasResetAt: [
        ...behaviourTag.ctasResetAt,
        ...behaviourTag.ctasResetInSessionAt,
      ],
    }
  }

  if (behaviourTag.ctaRelation) {
    deltaBehaviourTag.ctaRelation = {
      activeCtas: behaviourTag.activeCtas,
    }
  }

  return deltaBehaviourTag
}

export const setCtaDataToLocalStorage = (ctaData: CTA[]) => {
  NudgeStorage.setString(NudgeStorageKey.CTA_DATA, JSON.stringify(ctaData))
}

export const setCtaData = (ctaData: CTA[], latestCtas: CTA[]) => {
  let updatedCtaList: CTA[] = []
  for (let i = 0; i < ctaData.length; i++) {
    let isUpdated = false
    for (let j = 0; j < latestCtas.length; j++) {
      if (
        ctaData[i]?.behaviourTagName &&
        latestCtas[j]?.behaviourTagName &&
        ctaData[i].behaviourTagName === latestCtas[j].behaviourTagName
      ) {
        ctaData[i].behaviourTag = latestCtas[j].behaviourTag
      }
      if (ctaData[i].id === latestCtas[j].id) {
        updatedCtaList.push(latestCtas[j])
        isUpdated = true
        break
      }
    }
    if (!isUpdated) {
      updatedCtaList.push(ctaData[i])
    }
  }
  NudgeStorage.setString(
    NudgeStorageKey.CTA_DATA,
    JSON.stringify(updatedCtaList),
  )
}

export const updateCtasToLocalStorage = (latestCtas: CTA[]) => {
  const data = NudgeStorage.getString(NudgeStorageKey.CTA_DATA, '{}')
  if (data !== '') {
    let ctaData: CTA[] = JSON.parse(data) as CTA[]
    setCtaData(ctaData, latestCtas)
  }
}

export const getErrorDetails = (e: any): string => {
  return e && Object.keys(e).length > 0
    ? JSON.stringify(e)
    : 'Error object is empty or contains no useful information'
}
