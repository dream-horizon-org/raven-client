import RavenTextImpl, {FontWeight} from '../utils/raven-text/raven-text'
import {FontFamily} from '../utils/raven-text/font-family'
import {testProperties} from '../utils/test-properties'
import React from 'react'

import {
  DEFAULT_STRING_VALUE,
  DEFAULT_TEXT_VIEW_ID,
} from '../../../common/constants'
import type {TextViewType} from '../ViewTypes.interface'
import {resolveProp} from '../utils/StringUtils'

import {TouchableNudgeComponent} from './TouchableNudgeComponent'

type BaseTextProps = {
  data: TextViewType
  context: Record<string, unknown>
}

export const BaseText = ({data, context}: BaseTextProps) => {
  const {
    props: {
      title,
      testId,
      fontWeight: fontWeightValue,
      fontFamily: fontFamilyValue,
      numberOfLines = 0,
      ellipsizeMode = 'tail',
    } = {},
  } = data

  const text =
    resolveProp<string>(title, context, 'string') ?? DEFAULT_STRING_VALUE

  const viewId =
    resolveProp<string>(testId, context, 'string') ?? DEFAULT_TEXT_VIEW_ID

  const fontWeight =
    resolveProp<FontWeight>(fontWeightValue, context, 'string') ?? undefined

  const fontFamily =
    resolveProp<FontFamily | string>(fontFamilyValue, context, 'string') ??
    undefined

  return (
    <TouchableNudgeComponent viewData={data} context={context}>
      <RavenTextImpl
        {...testProperties(viewId)}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        style={data.styles}>
        {text}
      </RavenTextImpl>
    </TouchableNudgeComponent>
  )
}
