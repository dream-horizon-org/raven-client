import {memo, forwardRef, Ref, ReactNode} from 'react'
import React from 'react'

import {StyleProp, StyleSheet, Text, TextProps, TextStyle} from 'react-native'

import {getFontFamilyStyles} from './textformat'
import {FontWeight, FontFamily} from './font-family'
import {getFontStyles} from './raven-text.font-styles'

// Re-export FontWeight for backward compatibility
export {FontWeight, FontFamily}

/**
 * Custom style props for RavenText
 * 1. Omits `includeFontPadding`
 * 2. Custom `fontWeight` and `fontFamily`
 */
export type RavenTextStyle = {
  style?: StyleProp<Omit<TextStyle, 'fontWeight' | 'includeFontPadding'>>
  fontWeight?: FontWeight
  fontFamily?: FontFamily | string
  inheritColor?: boolean
}

/**
 * Custom props for RavenText
 * 1. Omits `allowFontScaling` and default `style`
 * 2. Adds custom `style` and `fontWeight` props
 */
export type RavenTextProps = Omit<TextProps, 'allowFontScaling' | 'style'> &
  RavenTextStyle & {
    children?: ReactNode
    ref?: Ref<Text> | undefined
  }

const RavenTextImpl = forwardRef(function RavenTextImpl(
  props: RavenTextProps,
  ref?: Ref<Text> | undefined,
) {
  const fontWeight = props.fontWeight || FontWeight.Regular
  const fontFamily = props.fontFamily

  // Get font styles based on family (if provided) or use default
  const font = fontFamily
    ? getFontStyles(fontWeight, fontFamily)
    : getFontFamilyStyles()

  return (
    <Text
      {...props}
      ref={ref}
      allowFontScaling={false}
      style={[
        !props.inheritColor && styles.textColor,
        props.style,
        font.text,
        fontWeight === FontWeight.Bold && font.weightBold,
        fontWeight === FontWeight.Medium && font.weightMedium,
        fontWeight === FontWeight.Regular && font.weightRegular,
      ]}>
      {props?.numberOfLines === 1 &&
      (props.ellipsizeMode ? props.ellipsizeMode === 'tail' : true)
        ? Array.isArray(props.children)
          ? props.children?.map((child, index) =>
              typeof child === 'string'
                ? child.replace(RegExp(' ', 'g'), '\u00A0')
                : React.isValidElement(child)
                  ? React.cloneElement(child, {key: `text-child-${index}`})
                  : child,
            )
          : props.children?.toString().replace(RegExp(' ', 'g'), '\u00A0')
        : props.children}
    </Text>
  )
})

const styles = StyleSheet.create({
  textColor: {
    color: '#1a1a1a',
  },
})

/**
 * A custom implementation of the Text component with
 * fontFamily fix
 */
export default memo(RavenTextImpl)
