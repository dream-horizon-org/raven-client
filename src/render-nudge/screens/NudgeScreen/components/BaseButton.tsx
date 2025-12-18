import React from 'react'
import RavenTextImpl, {FontWeight} from '../utils/raven-text/raven-text'
import {FontFamily} from '../utils/raven-text/font-family'

import {DEFAULT_STRING_VALUE} from '../../../common/constants'
import type {ButtonType} from '../ViewTypes.interface'
import {resolveProp} from '../utils/StringUtils'

import {TouchableNudgeComponent} from './TouchableNudgeComponent'

type BaseButtonProps = {
  data: ButtonType
  context: Record<string, unknown>
}
export const BaseButton = ({data, context}: BaseButtonProps) => {
  const btnText =
    resolveProp<string>(data.props.title, context, 'string') ??
    DEFAULT_STRING_VALUE

  const fontWeight =
    resolveProp<FontWeight>(data.props.fontWeight, context, 'string') ??
    undefined

  const fontFamily =
    resolveProp<FontFamily | string>(
      data.props.fontFamily,
      context,
      'string',
    ) ?? undefined

  return (
    <TouchableNudgeComponent viewData={data} context={context}>
      <RavenTextImpl
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        style={data.styles}>
        {btnText}
      </RavenTextImpl>
    </TouchableNudgeComponent>
  )
}
