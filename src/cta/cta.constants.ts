export const CTA_FAILURE_REASON = {
  STATE_MACHINE_EXPIRED: 'StateMachineExpired',
  SESSION_FREQUENCY_ENDED: 'SessionFrequencyEnded',
  WINDOW_FREQUENCY_ENDED: 'WindowFrequencyEnded',
  LIFESPAN_FREQUENCY_ENDED: 'LifespanFrequencyEnded',
  CTA_TTL_EXPIRED: 'CtaTTlExpired',
  GROUP_BY_KEYS_NOT_FOUND: 'GroupBykeysNotFound',
} as const

export const ANALYTICS_EVENT_GLOBAL_PROPS = 'AnalyticsEventGlobalProps'
