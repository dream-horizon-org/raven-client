import React, {useEffect, useRef} from 'react'

import {StyleSheet} from 'react-native'

import BottomSheet, {
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import {NudgeAnalyticsEvents} from '../../../../../cta/eventsFile'
import type {NudgeAnalyticsEventTypes} from '../../../../../cta/eventsFile'
import {ravenClient} from '../../../../../cta/ravenclient'

import {
  DEFAULT_NUMBER_VALUE,
  DEFAULT_STRING_VALUE,
} from '../../../../common/constants'
import {RenderView} from '../../RenderView'
import type {ViewType} from '../../ViewTypes.interface'
import {useNudgeNavigation} from '../../hooks/useNudgeNavigation'
import {resolveProp} from '../../utils/StringUtils'

import {CustomBackDrop} from './BottomsheetBackdrop'

type NudgeBottomSheetProps = {
  content: ViewType | undefined
  context: Record<string, unknown>
}

enum BottomSheetState {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
}

export const NudgeBottomsheet = (props: NudgeBottomSheetProps) => {
  const {context, content} = props

  const {openPreviousScreen} = useNudgeNavigation()

  const bottomSheetRef = useRef<BottomSheet>(null)

  useEffect(() => {
    sendNudgeBottomSheetEvent(
      NudgeAnalyticsEvents.NudgeBottomSheetShown,
      props,
      BottomSheetState.OPEN,
    )
    return () => {
      sendNudgeBottomSheetEvent(
        NudgeAnalyticsEvents.NudgeCtaDismissEvent,
        props,
        BottomSheetState.CLOSE,
      )
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => {
    return (
      <CustomBackDrop
        style={[backdropProps.style, styles.baseBackdropStyle]}
        opacity={0.1}
        backgroundColor={'transparent'}
        onPress={openPreviousScreen}
      />
    )
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enableDynamicSizing={true}
      handleComponent={null}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}>
      <BottomSheetView>
        <RenderView item={content} context={context} />
      </BottomSheetView>
    </BottomSheet>
  )
}

function sendNudgeBottomSheetEvent(
  eventName: keyof NudgeAnalyticsEventTypes,
  props: NudgeBottomSheetProps,
  bottomSheetState: string,
) {
  const {context, content} = props
  const clickTestId =
    resolveProp<string>(content?.props?.testId, context, 'string') ||
    DEFAULT_STRING_VALUE
  ravenClient.onAppEvent(eventName as string, {
    actionType: bottomSheetState,
    clickTestId: clickTestId,
    ctaId: (context?.ctaId as string) || DEFAULT_STRING_VALUE,
    currentState: (context?.currentState as number) || DEFAULT_NUMBER_VALUE,
    prevState: (context?.prevState as number) || DEFAULT_NUMBER_VALUE,
    stateMachineId: (context?.stateMachineId as string) || DEFAULT_STRING_VALUE,
    templateId: (context?.templateId as string) || DEFAULT_STRING_VALUE,
  })
}

const styles = StyleSheet.create({
  baseBackdropStyle: {flex: 1},
})
