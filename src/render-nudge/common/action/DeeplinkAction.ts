import {
  Linking,
  Platform,
  NativeEventEmitter,
  NativeModules,
} from 'react-native'

import {isSourceUriValid} from '../../screens/NudgeScreen/utils/RavenImage/RavenImage.utils'
const {TooltipModule} = NativeModules
export const nativeEventEmitter = new NativeEventEmitter(TooltipModule)

import {resolveProp} from '../../screens/NudgeScreen/utils/StringUtils'
import {DEFAULT_STRING_VALUE} from '../constants'

import type {DeeplinkActionProps} from './ActionType.interface'
import {DeeplinkRedirectionType} from './ActionType.interface'

export function triggerDeeplinkAction(
  props: DeeplinkActionProps,
  context: Record<string, unknown>,
  clickTestId: string,
) {
  const isAndroid = Platform.OS === 'android'
  const redirectionType = isAndroid
    ? props.params.androidUrlRedirectionType
    : props.params.iosUrlRedirectionType

  const deeplinkUrl = getResolveDeepLinkUrl(
    props,
    context,
    isAndroid,
    clickTestId,
  )
  openDeeplink(deeplinkUrl, redirectionType)
}

export function openDeeplink(
  deeplinkUrl: string,
  redirectionType: DeeplinkRedirectionType,
) {
  switch (redirectionType) {
    case DeeplinkRedirectionType.EXTERNAL_BROWSER:
      Linking.openURL(deeplinkUrl ?? '')
      break
    // case DeeplinkRedirectionType.INTERNAL_BROWSER:
    //   nudgeClient.openWebView(deeplinkUrl, '')
    //   break
    case DeeplinkRedirectionType.INTERNAL_APP:
      nativeEventEmitter.emit('url', {url: deeplinkUrl})
      break
    default:
      break
  }
}

export function getResolveDeepLinkUrl(
  props: DeeplinkActionProps,
  context: Record<string, unknown>,
  isAndroid: boolean,
  clickTestId: string,
): string {
  const templateTextUrl = isAndroid
    ? props.params.androidUrl
    : props.params.iosUrl
  let newUrl =
    resolveProp<string>(templateTextUrl, context, 'string') ??
    DEFAULT_STRING_VALUE
  const isValidDeepLinkUrl = isSourceUriValid(newUrl)
  if (isValidDeepLinkUrl) {
    const nudgeUrl = new URL(newUrl)
    nudgeUrl.searchParams.append('isFromCtaNudge', 'true')
    nudgeUrl.searchParams.append(
      'ctaId',
      context.ctaId?.toString() ?? DEFAULT_STRING_VALUE,
    )
    nudgeUrl.searchParams.append('clickTestId', clickTestId)
    nudgeUrl.searchParams.append(
      'templateId',
      context.templateId?.toString() ?? DEFAULT_STRING_VALUE,
    )
    return nudgeUrl.toString()
  }
  return DEFAULT_STRING_VALUE
}
