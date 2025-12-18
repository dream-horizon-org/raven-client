import {TextStyle, ViewStyle, ImageStyle} from 'react-native'

import {FontWeight} from './utils/raven-text/raven-text'
import {FontFamily} from './utils/raven-text/font-family'

import type {
  EventParamType,
  PrimitivePropertyDataType,
} from '../../../cta/cta.type'
import type {ActionProps} from '../../common/action/ActionType.interface'

import type {ViewTypes} from './utils/ViewTypesUtils'

export interface ViewType {
  type?: ViewTypes
  styles?: ViewStyle
  children?: RenderViewType[]
  props: Record<string, undefined | EventParamType | TemplateTextType[]>
}

export type ImageType = ViewType & {
  styles?: ImageStyle
  actions?: ActionProps[]
  props: {
    testId: undefined | string
    uri: undefined | EventParamType | TemplateTextType[]
    resizeMode: undefined | string
  }
}
export type TextViewType = ViewType & {
  styles?: TextStyle
  props: {
    testId: undefined | string
    title: undefined | EventParamType | TemplateTextType[]
    fontWeight: undefined | FontWeight
    fontFamily?: undefined | FontFamily | string
    numberOfLines?: number
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip'
  }
  actions?: ActionProps[]
}

export type ButtonType = ViewType & {
  styles?: TextStyle
  props: {
    testId: undefined | string
    title: undefined | EventParamType | TemplateTextType[]
    fontWeight: undefined | FontWeight
    fontFamily?: undefined | FontFamily | string
  }
  actions: ActionProps[]
}

export type TemplateTextType =
  | {
      isTemplateString: true
      variableName: string
      default: PrimitivePropertyDataType
      variableType: 'string' | 'number' | 'boolean'
    }
  | {
      isTemplateString: false
      value?: PrimitivePropertyDataType
    }

export type LottieType = ViewType & {
  styles?: ViewStyle
  actions?: ActionProps[]
  props: {
    testId: undefined | string
    uri: undefined | EventParamType | TemplateTextType[]
    autoPlay?: undefined | boolean
    loop?: undefined | boolean
    speed?: undefined | number
    progress?: undefined | number
    resizeMode?: undefined | 'cover' | 'contain' | 'center'
  }
}

export type RenderViewType =
  | ViewType
  | ImageType
  | TextViewType
  | ButtonType
  | LottieType
export type TouchableViewType =
  | ButtonType
  | ImageType
  | TextViewType
  | LottieType
