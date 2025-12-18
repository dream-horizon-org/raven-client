let currentScreen = ''

export const ScreenTracker = {
  setScreen: (screenName: string) => {
    currentScreen = screenName
  },
  getScreen: () => currentScreen,
}
