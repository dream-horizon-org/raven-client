import * as React from 'react'

import {TouchableNativeFeedback} from 'react-native'

import {testProperties} from '../utils/test-properties'

import type {NudgeNavigation} from '../../../common/action/ActionType.interface'
import {performActions} from '../../../common/action/utils/ClickActionUtils'
import {DEFAULT_TOUCHABLE_WRAPPER_VIEW_ID} from '../../../common/constants'
import type {TouchableViewType} from '../ViewTypes.interface'
import {useNudgeNavigation} from '../hooks/useNudgeNavigation'
import {resolveProp} from '../utils/StringUtils'

interface ChildProps {
  children: React.ReactNode
  viewData: TouchableViewType
  context: Record<string, unknown>
}
export const TouchableNudgeComponent = ({
  children,
  viewData,
  context,
}: ChildProps) => {
  const nudgeNavigation: NudgeNavigation = useNudgeNavigation()
  const onPress = () => {
    performActions(nudgeNavigation, viewData, context)
  }

  const viewId =
    resolveProp<string>(viewData.props.testId, context, 'string') ??
    DEFAULT_TOUCHABLE_WRAPPER_VIEW_ID

  return (
    <TouchableNativeFeedback onPress={onPress} {...testProperties(viewId)}>
      {children}
    </TouchableNativeFeedback>
  )
}
