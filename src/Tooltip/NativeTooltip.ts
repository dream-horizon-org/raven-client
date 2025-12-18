import {NativeModules} from 'react-native'

export interface TooltipOptions {
  targetId: string
  title: string
  subTitle?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  backgroundColor?: string
  titleColor?: string
  subTitleColor?: string
  titleFontSize?: number
  subTitleFontSize?: number
  titleFontFamily?: string
  subTitleFontFamily?: string
  titleFontWeight?: FontWeight
  subTitleFontWeight?: FontWeight
  targetScreen?: string
  triggerType?: 'mount' | 'click' | 'event'
  triggerDelay?: number
  autoDismissMs?: number
  dismissOnOutsideTouch?: boolean
  titleAlignment?: 'left' | 'center' | 'right'
  subTitleAlignment?: 'left' | 'center' | 'right'
  arrowSize?: number

  borderRadius?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
}

const {TooltipModule} = NativeModules

const defaultOptions: Partial<TooltipOptions> = {
  subTitle: '',
  position: 'top',
  backgroundColor: '#000000',
  titleColor: '#FFFFFF',
  subTitleColor: '#FFFFFF',
  autoDismissMs: 0,
  targetScreen: '',
  borderRadius: 0,
  titleFontSize: 16,
  subTitleFontSize: 14,
  dismissOnOutsideTouch: true,
  triggerDelay: 0,
  titleAlignment: 'left',
  subTitleAlignment: 'left',
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
  arrowSize: 16,
  triggerType: 'mount',
}

export enum FontWeight {
  Bold = 'Bold',
  Medium = 'Medium',
  Regular = 'Regular',
}

export const NativeTooltip = {
  show: (options: TooltipOptions) => {
    if (!TooltipModule)
      return Promise.reject(new Error('TooltipModule not available'))

    try {
      // Merge defaults + user-provided options
      const merged = {...defaultOptions, ...options}

      // Trim fontFamily values if provided (fontWeight is already in merged)
      const payload = {
        ...merged,
        ...(merged.titleFontFamily
          ? {titleFontFamily: merged.titleFontFamily.trim()}
          : {}),
        ...(merged.subTitleFontFamily
          ? {subTitleFontFamily: merged.subTitleFontFamily.trim()}
          : {}),
      }

      return TooltipModule.show(payload)
    } catch (error) {
      return Promise.reject()
    }
  },

  hide: (targetId: string) => {
    if (!TooltipModule)
      return Promise.reject(new Error('TooltipModule not available'))

    try {
      return new Promise<void>((resolve, reject) => {
        TooltipModule.hide(targetId, (error?: string) => {
          if (error) reject(new Error(error))
          else resolve()
        })
      })
    } catch (error) {
      return Promise.reject()
    }
  },

  hideAll: () => {
    if (!TooltipModule)
      return Promise.reject(new Error('TooltipModule not available'))

    try {
      return TooltipModule.hideAll()
    } catch (error) {
      return Promise.reject()
    }
  },
}
