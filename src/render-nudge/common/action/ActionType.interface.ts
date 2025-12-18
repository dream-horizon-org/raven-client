import type {AnalyticsEventPropertiesType} from '../../../cta/cta.type'
import type {TemplateTextType} from '../../screens/NudgeScreen/ViewTypes.interface'

export enum ActionTypeInterface {
  DEEPLINK = 'deeplink',
  DISMISS = 'dismiss',
  ANALYTICS_EVENT = 'analyticsEvent',
  EMIT_NATIVE_EVENT = 'emitNativeEvent',
  NONE = 'none',
}

export enum DeeplinkRedirectionType {
  EXTERNAL_BROWSER = 'EXTERNAL_BROWSER',
  INTERNAL_BROWSER = 'INTERNAL_BROWSER',
  INTERNAL_APP = 'INTERNAL_APP',
}

export type NudgeNavigation = {
  openPreviousScreen: () => void
}

export type BaseActionProps = {
  fallback: ActionTypeInterface
}

export type DeeplinkActionProps = {
  type: ActionTypeInterface.DEEPLINK
  params: {
    androidUrlRedirectionType: DeeplinkRedirectionType
    androidUrl: TemplateTextType[]
    iosUrlRedirectionType: DeeplinkRedirectionType
    iosUrl: TemplateTextType[]
  }
}

export type AnalyticsEventActionProps = {
  type: ActionTypeInterface.ANALYTICS_EVENT
  params: {
    eventName: string
    eventParams: DynamicArray[]
  }
}

export type EmitNativeEventProps = {
  type: ActionTypeInterface.EMIT_NATIVE_EVENT
  params: {
    eventName: string
    eventParams?: DynamicArray[]
  }
}

export type DynamicArray = {
  name: string
  type: AnalyticsEventPropertiesType
  value: TemplateTextType[]
}

export type DismissActionProps = {
  type: ActionTypeInterface.DISMISS
}

export type NoneActionProps = {
  type: ActionTypeInterface.NONE
}

export type ActionProps =
  | DeeplinkActionProps
  | AnalyticsEventActionProps
  | DismissActionProps
  | EmitNativeEventProps
  | NoneActionProps
