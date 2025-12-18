import React, {useMemo} from 'react'

import {Pressable, StyleProp, ViewStyle} from 'react-native'
import Animated, {useAnimatedStyle} from 'react-native-reanimated'

import {testProperties} from '../../utils/test-properties'

type CustomBackDropProps = {
  style: StyleProp<ViewStyle>
  opacity: number
  backgroundColor: string
  onPress: () => void
}
export const CustomBackDrop = (props: CustomBackDropProps) => {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: props.opacity,
  }))

  const containerStyle = useMemo(
    () => [
      props.style,
      {
        backgroundColor: props.backgroundColor,
      },
      containerAnimatedStyle,
    ],
    [containerAnimatedStyle, props.backgroundColor, props.style],
  )

  return (
    <Animated.View
      {...testProperties('bottomsheet-backdrop')}
      style={containerStyle}
      onTouchEnd={props.onPress}>
      <Pressable onPress={props.onPress} />
    </Animated.View>
  )
}
