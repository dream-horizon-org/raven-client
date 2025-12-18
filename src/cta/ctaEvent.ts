import {nudgeClient} from './nudgeclient'

const nudgeAppEvent = () => {
  return (
    eventName: string,
    eventObj: Record<string, string | boolean | number | null>,
  ) => {
    nudgeClient.onAppEvent(eventName, eventObj)
  }
}

export type AppEvent = {
  eventName: string
  props: Record<string, string | boolean | number | null>
}

const nudgeEvent = () => {
  const arr: Array<AppEvent> = []
  return {
    addEvent: (
      eventName: string,
      eventObj: Record<string, string | boolean | number | null>,
    ) => {
      arr.push({eventName, props: eventObj})
    },
    sendEvents: () => {
      if (arr.length > 0) {
        arr.forEach((event) => {
          nudgeClient.onAppEvent(event.eventName, event.props)
        })
        arr.length = 0
      }
    },
  }
}

export const nudgeOptimizedSendEvent = nudgeEvent()
export const sendNudgeAppEvent = nudgeAppEvent()
