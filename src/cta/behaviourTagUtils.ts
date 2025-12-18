import {BehaviourCtaRelationRule} from '../utils/AppUtils.constant'

import type {CtaRecord, CtaRelation, ExposureRule} from './cta.interface'
import {getMillisecondsInUnit} from './ctaUtils'

export const addUnique = (activeCtas: Array<string>, ctaId: string) => {
  if (!activeCtas.includes(ctaId)) {
    activeCtas.push(ctaId)
  }
}

export const remove = (activeCtas: Array<string>, ctaId: string) => {
  const indexToRemove = activeCtas.indexOf(ctaId)
  if (indexToRemove !== -1) {
    activeCtas.splice(indexToRemove, 1)
  }
}

export const getActiveCtaCount = (ctaRelation?: CtaRelation): number => {
  if (ctaRelation === undefined) return 0

  if (isAnyRestRule(ctaRelation)) {
    return 1
  }

  if (isCtaListRule(ctaRelation)) {
    return ctaRelation.shownCta?.ctaList?.length ?? 0
  }
  return 0
}

export const canCtaBeActiveCta = (
  ctaId: string,
  activeCtas: Array<string>,
  ctaRelation?: CtaRelation,
): boolean => {
  if (ctaRelation === undefined) {
    return false
  }
  if (isCtaAlreadyActiveCta(ctaId, activeCtas, ctaRelation)) {
    return false
  }
  if (!canWeAddMoreActiveCtas(activeCtas, ctaRelation)) {
    return false
  }

  const {shownCta, hideCta} = ctaRelation

  if (
    shownCta.rule === BehaviourCtaRelationRule.ANY &&
    hideCta.rule === BehaviourCtaRelationRule.REST
  ) {
    return true
  }

  if (
    shownCta.rule === BehaviourCtaRelationRule.LIST &&
    hideCta.rule === BehaviourCtaRelationRule.LIST
  ) {
    if (shownCta?.ctaList?.includes(ctaId)) {
      return true
    }
  }

  return false
}

export const isCtaAlreadyActiveCta = (
  ctaId: string,
  activeCtas: Array<string>,
  ctaRelation?: CtaRelation,
): boolean => {
  if (ctaRelation === undefined) {
    return false
  }
  return activeCtas.includes(ctaId)
}

export const canWeAddMoreActiveCtas = (
  activeCtas: Array<string>,
  ctaRelation?: CtaRelation,
): boolean => {
  if (ctaRelation === undefined) {
    return false
  }
  const activeCtaCount = getActiveCtaCount(ctaRelation)
  return activeCtas.length < activeCtaCount
}

export function isSessionFrequencyOver(
  exposureRule: ExposureRule,
  ctasResetInSessionAt: CtaRecord[],
) {
  if (exposureRule.session && exposureRule.session.limit) {
    return ctasResetInSessionAt.length >= exposureRule.session.limit
  } else {
    return false
  }
}

export function isWindowFrequencyOver(
  exposureRule: ExposureRule,
  recordOfTotalCtasResetAt: CtaRecord[],
) {
  if (
    exposureRule.window &&
    exposureRule.window.limit &&
    exposureRule.window.unit &&
    exposureRule.window.value
  ) {
    const currentTimestamp = Date.now()
    const windowStartTimestamp =
      currentTimestamp -
      exposureRule.window.value *
        getMillisecondsInUnit(exposureRule.window.unit)

    const countOfCtasResetWithInWindow = recordOfTotalCtasResetAt.filter(
      (ctaResetAtRecord) => ctaResetAtRecord.resetAt >= windowStartTimestamp,
    ).length
    return countOfCtasResetWithInWindow >= exposureRule.window.limit
  } else {
    return false
  }
}

export function isLifeSpanFrequencyOver(
  exposureRule: ExposureRule,
  recordOfTotalCtasResetAt: CtaRecord[],
) {
  return (
    exposureRule?.lifespan &&
    exposureRule.lifespan.limit &&
    recordOfTotalCtasResetAt.length >= exposureRule.lifespan.limit
  )
}

export function isActiveCta(
  activeCtas: Array<string>,
  activeCtaCount: number,
  ctaId: string,
) {
  return activeCtas.length < activeCtaCount || activeCtas.includes(ctaId)
}

export function isCtaPresentInShownHideList(
  ctaRelation: CtaRelation,
  ctaId: string,
) {
  const {shownCta, hideCta} = ctaRelation
  return shownCta?.ctaList && hideCta?.ctaList
    ? shownCta.ctaList.includes(ctaId) || hideCta.ctaList.includes(ctaId)
    : false
}

export function isCtaListRule(ctaRelation: CtaRelation) {
  const {shownCta, hideCta} = ctaRelation
  return (
    shownCta.rule === BehaviourCtaRelationRule.LIST &&
    hideCta.rule === BehaviourCtaRelationRule.LIST
  )
}

export function isAnyRestRule(ctaRelation: CtaRelation) {
  const {shownCta, hideCta} = ctaRelation
  return (
    shownCta.rule === BehaviourCtaRelationRule.ANY &&
    hideCta.rule === BehaviourCtaRelationRule.REST
  )
}
