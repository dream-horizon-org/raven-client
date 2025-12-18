import {StyleSheet} from 'react-native'

import {FontWeight, getFontFamily, FontFamily} from './font-family'

// Create dynamic font styles based on font family and weight
export function getFontStyles(
  _weight: FontWeight = FontWeight.Regular,
  family?: FontFamily | string,
) {
  return StyleSheet.create({
    weightBold: {
      fontFamily: getFontFamily(FontWeight.Bold, family),
    },
    weightMedium: {
      fontFamily: getFontFamily(FontWeight.Medium, family),
    },
    weightRegular: {
      fontFamily: getFontFamily(FontWeight.Regular, family),
    },
    text: {
      includeFontPadding: true,
    },
  })
}

// Default font styles (for backward compatibility)
export const FontStyles = StyleSheet.create({
  weightBold: {
    fontFamily: getFontFamily(FontWeight.Bold),
  },
  weightMedium: {
    fontFamily: getFontFamily(FontWeight.Medium),
  },
  weightRegular: {
    fontFamily: getFontFamily(FontWeight.Regular),
  },
  text: {
    includeFontPadding: true,
  },
})
