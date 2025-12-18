import LottieView, {LottieViewProps} from 'lottie-react-native'
import {Animated, ViewProps} from 'react-native'

export enum LottieWrapperType {
  REANIMATED = 'REANIMATED',
  ANIMATED = 'ANIMATED',
  NONE = 'NONE',
}

// Creating default type since it's added to LottieProps and not exported from package.
// https://github.com/lottie-react-native/lottie-react-native/blob/master/packages/core/src/LottieView/index.tsx#L12
interface DefaultContainerProps {
  containerProps?: ViewProps
}

export interface RavenLottieViewPropsWithReanimated
  extends DefaultContainerProps, LottieViewProps {
  lottieWrapperType: LottieWrapperType.REANIMATED
  animatedProps?: Partial<{
    progress: number
  }>
}

export interface RavenLottieViewPropsWithRnAnimated
  extends DefaultContainerProps, Omit<LottieViewProps, 'progress'> {
  lottieWrapperType: LottieWrapperType.ANIMATED
  progress?: Animated.Value
}

export interface RavenLottieViewPropsWithoutWrapper
  extends DefaultContainerProps, LottieViewProps {
  lottieWrapperType: LottieWrapperType.NONE
}

export type RavenLottieViewProps =
  | RavenLottieViewPropsWithoutWrapper
  | RavenLottieViewPropsWithRnAnimated
  | RavenLottieViewPropsWithReanimated

export type RavenLottieViewRef = LottieView
