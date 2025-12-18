import {nativeEventEmitter} from './DeeplinkAction'

import type {EventParamType} from '../../../cta/cta.type'

export const triggerNativeEventViaEmitterAction = (
  eventName: string,
  eventParams?: Record<string, EventParamType>,
) => {
  nativeEventEmitter.emit(eventName, eventParams)
}
