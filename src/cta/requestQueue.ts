import type {DeltaSnapShot} from './cta.interface'
import {
  addRequestToLocal,
  getRequestMapFromLocal,
  mergeRequestQueue,
  removeRequestMapFromLocal,
  shouldNotSendDelta,
} from './ctaUtils'
import {makeCtaApiPostRequest} from './makeCtaApi'

let requestInFlight = false
let requestQueue: DeltaSnapShot = {ctas: []}
export function addRequestToQueue(requestMap: DeltaSnapShot) {
  requestQueue = mergeRequestQueue(requestQueue, requestMap)
  makeDeltaSnapShotApiCall()
}

export async function makeDeltaSnapShotApiCall() {
  if (shouldNotSendDelta(requestQueue, requestInFlight)) {
    return
  }
  requestInFlight = true
  let requestMapFromQueue = requestQueue
  requestQueue = {ctas: []}
  const requestMapFromLocal = getRequestMapFromLocal()

  if (requestMapFromLocal)
    requestMapFromQueue = mergeRequestQueue(
      requestMapFromLocal,
      requestMapFromQueue,
    )
  try {
    await makeCtaApiPostRequest<DeltaSnapShot, void>(
      'cta/state-machines/snapshot/delta/',
      requestMapFromQueue,
    )
    removeRequestMapFromLocal()
  } catch (e) {
    removeRequestMapFromLocal()
    addRequestToLocal(requestMapFromQueue)
  } finally {
    requestInFlight = false
    makeDeltaSnapShotApiCall()
  }
}
