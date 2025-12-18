import {forwardRef} from 'react'

import LottieView from 'lottie-react-native'
import {Animated as RnAnimated} from 'react-native'
import Animated from 'react-native-reanimated'

import {
  RavenLottieViewProps,
  RavenLottieViewPropsWithReanimated,
  RavenLottieViewPropsWithoutWrapper,
  LottieWrapperType,
} from './LottieView.interface'

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView)
const RnAnimatedLottieView = RnAnimated.createAnimatedComponent(LottieView)

export const RavenLottieView = forwardRef<LottieView, RavenLottieViewProps>(
  ({lottieWrapperType, ...rest}, ref) => {
    switch (lottieWrapperType) {
      case LottieWrapperType.NONE: {
        const {progress} = rest as RavenLottieViewPropsWithoutWrapper
        return <LottieView ref={ref} {...rest} progress={progress} />
      }
      case LottieWrapperType.ANIMATED: {
        return <RnAnimatedLottieView ref={ref} {...rest} />
      }
      case LottieWrapperType.REANIMATED: {
        const {animatedProps, ...otherProps} =
          rest as RavenLottieViewPropsWithReanimated
        return (
          <AnimatedLottieView
            ref={ref}
            {...otherProps}
            progress={animatedProps?.progress}
          />
        )
      }
      default: {
        return <></>
      }
    }
  },
)
