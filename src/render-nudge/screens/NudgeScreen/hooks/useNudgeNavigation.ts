import {useCallback} from 'react'

import {goBack} from '../../../../utils/NavigationContainerRef'

import type {NudgeNavigation} from '../../../common/action/ActionType.interface'

export const useNudgeNavigation: () => NudgeNavigation = () => {
  const openPreviousScreen = useCallback(() => {
    goBack()
  }, [])

  return {
    openPreviousScreen,
  }
}
