import {makeBatchedDeltaSnapShotApiCall} from '../cta/batchRequestQueue'
import type {DeltaSnapShot} from '../cta/cta.interface'
import {
  getBatchedRequestMapFromLocal,
  getInTransitRequestMapFromLocal,
  mergeRequestQueue,
  addBatchRequestTolocal,
  addInTransitRequestTolocal,
  removeBatchRequestMapFromLocal,
} from '../cta/ctaUtils'

export class BatchHelper {
  private batchSize: number = 10

  private timeInterval: number = 1000

  private lastBatchTime: number

  private batchCounter: number
  constructor() {
    this.lastBatchTime = Date.now()
    this.batchCounter = 0
    this.startTimer()
  }

  public enqueue(inComingRequestMap: DeltaSnapShot) {
    const batchRequestMapFromLocal = getBatchedRequestMapFromLocal()
    let batchRequestMap = inComingRequestMap

    if (batchRequestMapFromLocal) {
      batchRequestMap = mergeRequestQueue(
        batchRequestMapFromLocal,
        batchRequestMap,
      )
    }
    addBatchRequestTolocal(batchRequestMap)

    this.batchCounter++
    this.processIfNeeded()
  }

  private size(): number {
    return this.batchCounter
  }

  private shouldBatchBySize(): boolean {
    return this.size() >= this.batchSize
  }

  private shouldBatchByTime(): boolean {
    return Date.now() - this.lastBatchTime >= this.timeInterval
  }

  private resetBatchTimer() {
    this.lastBatchTime = Date.now()
  }

  private isBatchingCriteriaFulfilled() {
    return this.shouldBatchBySize() || this.shouldBatchByTime()
  }

  private processIfNeeded() {
    if (this.isBatchingCriteriaFulfilled()) {
      let inTransitRequestMap = getInTransitRequestMapFromLocal()
      let batchRequestMapFromLocal = getBatchedRequestMapFromLocal()

      if (inTransitRequestMap == null && batchRequestMapFromLocal) {
        addInTransitRequestTolocal(batchRequestMapFromLocal)
        removeBatchRequestMapFromLocal()
        inTransitRequestMap = batchRequestMapFromLocal

        makeBatchedDeltaSnapShotApiCall(inTransitRequestMap)
      }

      this.resetBatchTimer()
      this.batchCounter = 0
    }
  }

  private startTimer() {
    setInterval(() => {
      this.processIfNeeded()
    }, this.timeInterval)
  }
}
