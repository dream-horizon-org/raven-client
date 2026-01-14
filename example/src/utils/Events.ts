import {trackAppEvent} from '@dreamhorizonorg/raven-client'
import type {CTAEvent} from '../../../src/cta/cta.interface'

export const sendCtaEvent = (event: CTAEvent) => {
  trackAppEvent(event)
}
