import {NativeModules} from 'react-native'

const {ScreenInspector} = NativeModules

export const ScreenInspectorModule = {
  /**
   * Manually capture the current screen data
   */
  async captureScreen() {
    try {
      const data = await ScreenInspector.captureScreen()
      return data
    } catch (e) {
      throw e
    }
  },

  /**
   * Update current route (optional, if not using useNavigationTracker)
   */
  setCurrentScreen(routeName: string) {
    ScreenInspector.setCurrentScreen(routeName)
  },
}
