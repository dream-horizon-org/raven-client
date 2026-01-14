import React, {useEffect} from 'react'

import {StyleSheet, Modal, TouchableNativeFeedback, View} from 'react-native'

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

type NudgePopupProps = {
  content: ViewType | undefined
  context: Record<string, unknown>
}

enum PopupState {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
}

export const NudgePopup = (props: NudgePopupProps) => {
  const {context, content} = props

  const {openPreviousScreen} = useNudgeNavigation()

  useEffect(() => {
    sendNudgePopupEvent(
      NudgeAnalyticsEvents.NudgePopupShown,
      props,
      PopupState.OPEN,
    )
    return () => {
      sendNudgePopupEvent(
        NudgeAnalyticsEvents.NudgeCtaDismissEvent,
        props,
        PopupState.CLOSE,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBackdropPress = () => {
    openPreviousScreen()
  }

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={handleBackdropPress}>
      <TouchableNativeFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <RenderView item={content?.children?.[0]} context={context} />
        </View>
      </TouchableNativeFeedback>
    </Modal>
  )
}

function sendNudgePopupEvent(
  eventName: keyof NudgeAnalyticsEventTypes,
  props: NudgePopupProps,
  popupState: string,
) {
  const {context, content} = props
  const clickTestId =
    resolveProp<string>(content?.props?.testId, context, 'string') ||
    DEFAULT_STRING_VALUE
  ravenClient.onAppEvent(eventName, {
    actionType: popupState,
    clickTestId: clickTestId,
    ctaId: (context?.ctaId as string) || DEFAULT_STRING_VALUE,
    currentState: (context?.currentState as number) || DEFAULT_NUMBER_VALUE,
    prevState: (context?.prevState as number) || DEFAULT_NUMBER_VALUE,
    stateMachineId: (context?.stateMachineId as string) || DEFAULT_STRING_VALUE,
    templateId: (context?.templateId as string) || DEFAULT_STRING_VALUE,
  })
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
