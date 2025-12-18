import {useEffect, useState} from 'react'
import React, {ReactNode} from 'react'

import {nativeEventEmitter} from '../../common/action/DeeplinkAction'
import {ActionType} from '../../../cta/cta.interface'
import type {NudgeParams} from './Nudge.interface'
import {RenderView} from './RenderView'
import {NudgePopup} from './components/Popup/NudgePopup'
import {useNudgeEvents} from './hooks/useNudgeEvents'
export enum EmitterConstants {
  NUDGE_UI_LIVE_UPDATE_PREVIEW = 'NUDGE_UI_LIVE_UPDATE_PREVIEW',
}
type Route<
  RouteName extends string,
  Params extends object | undefined = object | undefined,
> = Readonly<{
  /**
   * Unique key for the route.
   */
  key: string
  /**
   * User-provided name for the route.
   */
  name: RouteName
  /**
   * Path associated with the route.
   * Usually present when the screen was opened from a deep link.
   */
  path?: string
}> &
  (undefined extends Params
    ? Readonly<{
        /**
         * Params for this route
         */
        params?: Readonly<Params>
      }>
    : Readonly<{
        /**
         * Params for this route
         */
        params: Readonly<Params>
      }>)

export type LazyComponentProps<
  Params extends object | undefined = object | undefined,
> = {
  route: Route<string, Params>
  navigation?: any
  children?: ReactNode
}

export const Nudge = (props: LazyComponentProps<NudgeParams>) => {
  const param = props.route?.params || props
  const {context, data, isNudgeStreamingPreviewMode = false, actionType} = param

  // Parse JSON strings if needed (Expo Router serializes params as strings)
  const parsedData = typeof data === 'string' ? JSON.parse(data) : data
  const parsedContext =
    typeof context === 'string' ? JSON.parse(context) : context

  const [state, setState] = useState({
    data: parsedData,
    context: parsedContext,
    actionType,
  })
  const {emitNudgeCtaShownEvent} = useNudgeEvents(parsedContext)
  useEffect(() => {
    if (isNudgeStreamingPreviewMode) {
      return
    }
    emitNudgeCtaShownEvent() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNudgeStreamingPreviewMode])

  useEffect(() => {
    const listener = nativeEventEmitter.addListener(
      EmitterConstants.NUDGE_UI_LIVE_UPDATE_PREVIEW,
      (params: NudgeParams) => {
        setState(params)
      },
    )

    return () => {
      listener.remove()
    }
  }, [isNudgeStreamingPreviewMode])

  if (actionType === ActionType.NUDGE_POPUP) {
    return <NudgePopup content={state.data} context={state.context} />
  } else {
    return <RenderView item={state.data} context={state.context} />
  }
}
