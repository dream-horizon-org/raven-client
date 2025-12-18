import {
  addUnique,
  canCtaBeActiveCta,
  getActiveCtaCount,
  isActiveCta,
  isAnyRestRule,
  isCtaListRule,
  isCtaPresentInShownHideList,
  isLifeSpanFrequencyOver,
  isSessionFrequencyOver,
  isWindowFrequencyOver,
} from './behaviourTagUtils'
import type {BehaviourTagInfo, CtaRecord} from './cta.interface'

export class BehaviourTag {
  behaviourTagName: BehaviourTagInfo['behaviourTagName']

  exposureRule: BehaviourTagInfo['exposureRule']

  ctaRelation: BehaviourTagInfo['ctaRelation']

  ctasResetAt: CtaRecord[]

  ctasResetInSessionAt: CtaRecord[]

  activeCtas: Array<string>

  constructor(behaviourTagInfo: BehaviourTagInfo | BehaviourTag) {
    if ('ctasResetInSessionAt' in behaviourTagInfo) {
      this.behaviourTagName = behaviourTagInfo.behaviourTagName
      this.exposureRule = behaviourTagInfo.exposureRule
      this.ctaRelation = behaviourTagInfo.ctaRelation
      this.ctasResetInSessionAt = behaviourTagInfo.ctasResetInSessionAt
      this.ctasResetAt = behaviourTagInfo.ctasResetAt
      this.activeCtas = behaviourTagInfo.activeCtas
    } else {
      this.behaviourTagName = behaviourTagInfo.behaviourTagName
      this.exposureRule = behaviourTagInfo.exposureRule || undefined
      this.ctaRelation = behaviourTagInfo.ctaRelation || undefined
      this.ctasResetInSessionAt = []
      this.ctasResetAt = behaviourTagInfo.exposureRule?.ctasResetAt || []
      this.activeCtas = behaviourTagInfo.ctaRelation?.activeCtas || []
    }
  }

  isCtasRelationValid(ctaId: string) {
    if (this.ctaRelation === undefined) return true
    const {shownCta, hideCta} = this.ctaRelation
    const activeCtaCount = getActiveCtaCount(this.ctaRelation)

    if (isAnyRestRule(this.ctaRelation)) {
      return isActiveCta(this.activeCtas, activeCtaCount, ctaId)
    }

    if (isCtaListRule(this.ctaRelation)) {
      if (!isCtaPresentInShownHideList(this.ctaRelation, ctaId)) {
        return true
      } else if (
        hideCta?.ctaList?.includes(ctaId) &&
        this.activeCtas.length < 1
      ) {
        return true
      } else if (
        shownCta?.ctaList?.includes(ctaId) &&
        isActiveCta(this.activeCtas, activeCtaCount, ctaId)
      ) {
        return true
      }
    }
    return false
  }

  isExposureFrequencyValid(): boolean {
    if (this.exposureRule === undefined) return true
    const {ctasResetInSessionAt, ctasResetAt, exposureRule} = this
    const recordOfTotalCtasResetAt = [...ctasResetInSessionAt, ...ctasResetAt]
    if (isLifeSpanFrequencyOver(exposureRule, recordOfTotalCtasResetAt)) {
      return false
    }

    if (isWindowFrequencyOver(exposureRule, recordOfTotalCtasResetAt)) {
      return false
    }

    if (isSessionFrequencyOver(exposureRule, ctasResetInSessionAt)) {
      return false
    }

    return true
  }

  makeCtaActiveForBehaviourTag(ctaId: string) {
    if (this.ctaRelation === undefined) {
      return
    }
    if (canCtaBeActiveCta(ctaId, this.activeCtas, this.ctaRelation)) {
      addUnique(this.activeCtas, ctaId)
    }
  }

  addCtaResetInSessionAt(ctaId: string, resetTimeStamp: number) {
    if (this.exposureRule === undefined) {
      return
    }
    this.ctasResetInSessionAt.push({
      ctaId: ctaId,
      resetAt: resetTimeStamp,
    })
  }
}
