import type {NudgeNavigation} from './ActionType.interface'

export function triggerDismissAction(nudgeNav: NudgeNavigation) {
  nudgeNav.openPreviousScreen()
}
