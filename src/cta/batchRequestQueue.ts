import type {DeltaSnapShot} from './cta.interface'
import {
  addBatchRequestTolocal,
  getBatchedRequestMapFromLocal,
  mergeRequestQueue,
  removeInTransitRequestMapFromLocal,
} from './ctaUtils'
import {makeCtaApiPostRequest} from './makeCtaApi'

export async function makeBatchedDeltaSnapShotApiCall(
  transitRequestMap: DeltaSnapShot,
) {
  try {
    await makeCtaApiPostRequest<DeltaSnapShot, void>(
      'cta/state-machines/snapshot/delta/',
      transitRequestMap,
    )
  } catch (e) {
    let batchRequestMapFromLocal = getBatchedRequestMapFromLocal()

    if (batchRequestMapFromLocal && transitRequestMap) {
      batchRequestMapFromLocal = mergeRequestQueue(
        transitRequestMap,
        batchRequestMapFromLocal,
      )
    } else {
      batchRequestMapFromLocal = transitRequestMap
    }

    if (batchRequestMapFromLocal)
      addBatchRequestTolocal(batchRequestMapFromLocal)
  } finally {
    removeInTransitRequestMapFromLocal()
  }
}
