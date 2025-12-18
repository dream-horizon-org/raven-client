import {BatchHelper} from './BatchHelper'

let batchHelperInstance: BatchHelper | null = null

export function getBatchHelperInstance(): BatchHelper {
  if (!batchHelperInstance) {
    batchHelperInstance = new BatchHelper()
  }
  return batchHelperInstance
}
